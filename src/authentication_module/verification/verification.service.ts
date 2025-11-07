import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan } from "typeorm";
import {
  Verification,
  VerificationStatus,
  VerificationType,
} from "./verification.entity";
import { User } from "../users/users.entity";
import { sendEmail } from "../../utils/email";

@Injectable()
export class VerificationService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;
  private readonly RESEND_COOLDOWN_MINUTES = 1;

  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  /**
   * Generate a cryptographically secure random OTP
   */
  private generateOTP(): string {
    const crypto = require("crypto");
    const digits = "0123456789";
    let otp = "";

    // Generate secure random bytes and convert to digits
    const buffer = crypto.randomBytes(this.OTP_LENGTH);
    for (let i = 0; i < this.OTP_LENGTH; i++) {
      otp += digits[buffer[i] % 10];
    }
    return otp;
  }

  /**
   * Calculate expiry time for OTP
   */
  private getExpiryTime(): Date {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + this.OTP_EXPIRY_MINUTES);
    return expiryTime;
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Check if user exists by identifier with enumeration protection
   */
  private async findUserByIdentifier(
    identifier: string,
    type: VerificationType
  ): Promise<User> {
    await this.randomDelay();

    const whereCondition =
      type === VerificationType.EMAIL
        ? { email: identifier.toLowerCase() }
        : { contact_number: identifier };

    const user = await this.userRepository.findOne({
      where: whereCondition,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  /**
   * Add random delay to prevent timing-based attacks
   */
  private async randomDelay(): Promise<void> {
    const delay = Math.random() * 100; // 0-100ms random delay
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Clean up expired verification records
   */
  private async cleanupExpiredRecords(): Promise<void> {
    await this.verificationRepository.delete({
      expires_at: LessThan(new Date()),
    });
  }

  /**
   * Send verification OTP (email or phone)
   */
  async sendVerificationOTP(
    type: VerificationType,
    identifier: string
  ): Promise<{ message: string; user_id: number }> {
    try {
      const user = await this.validateAndPrepareUser(identifier, type);
      await this.checkResendCooldown(type, identifier);

      const otp = await this.createAndSendOTP(user, type);

      return {
        message: `${type} verification code sent successfully`,
        user_id: user.id,
      };
    } catch (error) {
      // Log detailed error for debugging
      console.error("Send verification OTP error:", error);

      // Convert unexpected errors to generic messages
      if (
        !(error instanceof NotFoundException) &&
        !(error instanceof ConflictException) &&
        !(error instanceof ForbiddenException)
      ) {
        throw new InternalServerErrorException(
          "Failed to send verification code"
        );
      }

      throw error;
    }
  }

  /**
   * Validate user and check verification status
   */
  private async validateAndPrepareUser(
    identifier: string,
    type: VerificationType
  ): Promise<User> {
    await this.cleanupExpiredRecords();

    const user = await this.findUserByIdentifier(identifier, type);

    // Check if already verified
    if (type === VerificationType.EMAIL && user.is_email_verified) {
      throw new ConflictException("Email is already verified");
    }
    if (type === VerificationType.PHONE && user.is_phone_verified) {
      throw new ConflictException("Phone is already verified");
    }

    return user;
  }

  /**
   * Check cooldown period for resending
   */
  private async checkResendCooldown(
    type: VerificationType,
    identifier: string
  ): Promise<void> {
    const existingVerification = await this.verificationRepository.findOne({
      where: {
        type,
        identifier: identifier.toLowerCase(),
        status: VerificationStatus.PENDING,
      },
      order: { created_at: "DESC" },
    });

    if (existingVerification) {
      const timeSinceLastSend =
        new Date().getTime() - existingVerification.created_at.getTime();
      const cooldownMs = this.RESEND_COOLDOWN_MINUTES * 60 * 1000;

      if (timeSinceLastSend < cooldownMs) {
        const remainingTime = Math.ceil(
          (cooldownMs - timeSinceLastSend) / 1000
        );
        throw new ForbiddenException(
          `Please wait ${remainingTime} seconds before requesting a new code`
        );
      }
    }
  }

  /**
   * Create and send OTP
   */
  private async createAndSendOTP(
    user: User,
    type: VerificationType
  ): Promise<string> {
    // Invalidate existing pending verifications
    await this.verificationRepository.update(
      {
        type,
        identifier:
          type === VerificationType.EMAIL ? user.email : user.contact_number,
        status: VerificationStatus.PENDING,
      },
      {
        status: VerificationStatus.EXPIRED,
      }
    );

    // Generate new OTP
    const otp = this.generateOTP();
    const expiresAt = this.getExpiryTime();

    // Create verification record
    const verification = this.verificationRepository.create({
      type,
      identifier:
        type === VerificationType.EMAIL ? user.email : user.contact_number,
      otp,
      expires_at: expiresAt,
      status: VerificationStatus.PENDING,
      attempts: 0,
      user_id: user.id,
    });

    await this.verificationRepository.save(verification);

    // Send OTP
    if (type === VerificationType.EMAIL) {
      await this.sendEmailOTP(user, otp);
    } else {
      await this.sendPhoneOTP(user, otp);
    }

    return otp;
  }

  /**
   * Send email OTP
   */
  private async sendEmailOTP(user: User, otp: string): Promise<void> {
    if (!user.email) {
      throw new BadRequestException(
        "User email is required for email verification"
      );
    }

    const emailData = {
      name: user.name || "User",
      otp: otp,
    };

    await sendEmail(
      "Email Verification OTP",
      "otp-email",
      emailData,
      user.email
    );
  }

  /**
   * Send phone OTP (placeholder for future implementation)
   */
  private async sendPhoneOTP(user: User, otp: string): Promise<void> {
    if (!user.contact_number) {
      throw new BadRequestException(
        "User phone number is required for phone verification"
      );
    }

    // TODO: Implement SMS service integration here
    // For now, we'll log the OTP (in production, this would be sent via SMS)
    console.log(`SMS OTP for ${user.contact_number}: ${otp}`);

    // Example implementation would be:
    // await this.smsService.sendSMS(user.contact_number, `Your OTP is ${otp}`);
  }

  /**
   * Verify OTP with brute force protection
   */
  async verifyOTP(
    type: VerificationType,
    identifier: string,
    otp: string,
    clientIP?: string
  ): Promise<{ message: string; verified: boolean }> {
    try {
      const verification = await this.findActiveVerification(type, identifier);

      // Check rate limiting
      await this.checkRateLimit(verification, type, identifier);

      // Validate verification record
      await this.validateVerificationRecord(verification, type, identifier);

      // Process OTP verification in transaction
      const result = await this.processOTPVerification(
        verification,
        otp,
        type,
        identifier
      );

      return result;
    } catch (error) {
      // Log detailed error for debugging but don't expose to frontend
      console.error("OTP verification error:", error);

      // Convert all unexpected errors to generic internal server error
      if (
        !(error instanceof NotFoundException) &&
        !(error instanceof BadRequestException) &&
        !(error instanceof ConflictException) &&
        !(error instanceof ForbiddenException)
      ) {
        throw new InternalServerErrorException("Internal Server Error");
      }

      throw error;
    }
  }

  /**
   * Find active verification record
   */
  private async findActiveVerification(
    type: VerificationType,
    identifier: string
  ): Promise<Verification> {
    // Clean up expired records first
    await this.cleanupExpiredRecords();

    const verification = await this.verificationRepository.findOne({
      where: {
        type,
        identifier: identifier.toLowerCase(),
        status: VerificationStatus.PENDING,
      },
      order: { created_at: "DESC" },
    });

    if (!verification) {
      throw new NotFoundException("Verification code not valid");
    }

    return verification;
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(
    verification: Verification,
    type: VerificationType,
    identifier: string
  ): Promise<void> {
    // Check if verification is expired
    if (new Date() > verification.expires_at) {
      verification.status = VerificationStatus.EXPIRED;
      await this.verificationRepository.save(verification);
      throw new ForbiddenException(
        "The verification code has expired. Please request a new one."
      );
    }

    // Check max attempts
    if (verification.attempts >= this.MAX_ATTEMPTS) {
      verification.status = VerificationStatus.FAILED;
      await this.verificationRepository.save(verification);
      throw new ForbiddenException("Maximum verification attempts reached");
    }
  }

  /**
   * Validate verification record
   */
  private async validateVerificationRecord(
    verification: Verification,
    type: VerificationType,
    identifier: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where:
        type === VerificationType.EMAIL
          ? { email: identifier.toLowerCase() }
          : { contact_number: identifier },
    });

    if (user) {
      const isVerified =
        type === VerificationType.EMAIL
          ? user.is_email_verified
          : user.is_phone_verified;

      if (isVerified) {
        throw new ConflictException(
          `${type} is already verified. Please try logging in.`
        );
      }
    }
  }

  /**
   * Process OTP verification with transaction
   */
  private async processOTPVerification(
    verification: Verification,
    otp: string,
    type: VerificationType,
    identifier: string
  ): Promise<{ message: string; verified: boolean }> {
    const queryRunner =
      this.verificationRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Verify OTP using constant-time comparison
      const isValidOTP = this.constantTimeEqual(verification.otp, otp);

      if (!isValidOTP) {
        verification.attempts += 1;

        // Mark as failed if this was the last attempt
        if (verification.attempts >= this.MAX_ATTEMPTS) {
          verification.status = VerificationStatus.FAILED;
        }

        await queryRunner.manager.save(verification);
        throw new BadRequestException("Invalid verification code");
      }

      // Update verification status
      verification.status = VerificationStatus.VERIFIED;
      verification.verified_at = new Date();
      await queryRunner.manager.save(verification);

      // Update user verification status
      const user = await queryRunner.manager.findOne(User, {
        where:
          type === VerificationType.EMAIL
            ? { email: identifier.toLowerCase() }
            : { contact_number: identifier },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (type === VerificationType.EMAIL) {
        user.is_email_verified = true;
        user.email_verified_at = new Date();
      } else {
        user.is_phone_verified = true;
        user.phone_verified_at = new Date();
      }

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return {
        message: `${type} verified successfully`,
        verified: true,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Check verification status for an identifier
   */
  async checkVerificationStatus(
    type: VerificationType,
    identifier: string
  ): Promise<{
    is_verified: boolean;
    verified_at?: Date;
    pending_verification?: boolean;
  }> {
    try {
      await this.cleanupExpiredRecords();
      const user = await this.findUserByIdentifier(identifier, type);

      const isVerified =
        type === VerificationType.EMAIL
          ? user.is_email_verified
          : user.is_phone_verified;

      const verifiedAt =
        type === VerificationType.EMAIL
          ? user.email_verified_at
          : user.phone_verified_at;

      // Check for pending verification
      const pendingVerification = await this.verificationRepository.findOne({
        where: {
          type,
          identifier,
          status: VerificationStatus.PENDING,
        },
      });

      return {
        is_verified: isVerified,
        verified_at: verifiedAt,
        pending_verification: !!pendingVerification,
      };
    } catch (error) {
      console.error("Check verification status error:", error);

      if (!(error instanceof NotFoundException)) {
        throw new InternalServerErrorException("Internal Server Error");
      }

      throw error;
    }
  }

  /**
   * Get user's verification status
   */
  async getUserVerificationStatus(userId: number): Promise<{
    email_verified: boolean;
    phone_verified: boolean;
    email_verified_at?: Date;
    phone_verified_at?: Date;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: [
          "id",
          "is_email_verified",
          "is_phone_verified",
          "email_verified_at",
          "phone_verified_at",
        ],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return {
        email_verified: user.is_email_verified,
        phone_verified: user.is_phone_verified,
        email_verified_at: user.email_verified_at,
        phone_verified_at: user.phone_verified_at,
      };
    } catch (error) {
      console.error("Get user verification status error:", error);

      if (!(error instanceof NotFoundException)) {
        throw new InternalServerErrorException("Internal Server Error");
      }

      throw error;
    }
  }
}
