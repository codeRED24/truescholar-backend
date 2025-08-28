import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as nodemailer from "nodemailer";
import * as bcrypt from "bcrypt";
import { RegisterUserDto } from "./dto/register-users.dto";
import { User } from "../users/users.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { OtpRequest } from "../users/user-otp.entity";
import { UserService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(OtpRequest)
    private readonly otpRepository: Repository<OtpRequest>,
    private readonly userService: UserService
  ) {}

  // Create a new user record
  async create(
    createUserDto: RegisterUserDto
  ): Promise<{ user: User; isExisting: boolean }> {
    const payload: any = { ...createUserDto };

    // If custom_code not provided, generate one
    if (!payload.custom_code) {
      const nameStr = (payload.name || "").replace(/\s+/g, "");
      const prefix = nameStr ? nameStr.substring(0, 3).toUpperCase() : "USR";
      payload.custom_code = `${prefix}${Date.now()}`;
    }

    // Check if a user already exists by email or phone. If yes, return only id and custom_code
    if (payload.email || payload.contact_number) {
      const whereClause: any = [];
      if (payload.email) whereClause.push({ email: payload.email });
      if (payload.contact_number)
        whereClause.push({ contact_number: payload.contact_number });

      const existingUser = await this.userRepository.findOne({
        where: whereClause,
        select: ["id", "custom_code"],
      });

      if (existingUser) {
        // Return existing user with flag
        return { user: existingUser as any, isExisting: true };
      }
    }

    // Hash password if provided
    if (payload.password) {
      const salt = await bcrypt.genSalt();
      payload.password = await bcrypt.hash(payload.password, salt);
    }

    const user = this.userRepository.create(payload as User);

    try {
      const savedUser = await this.userRepository.save(user);
      return { user: savedUser, isExisting: false };
    } catch (error) {
      throw error;
    }
  }

  async login(user: any) {
    const payload = { id: user.id, user_type: user.user_type };
    const { password, ...userData } = user;
    return {
      access_token: this.jwtService.sign(payload),
      user: userData,
    };
  }

  async validateUser(identifier: string, pass: string): Promise<any> {
    // Try to find user by email first
    let user = await this.userRepository.findOne({
      where: { email: identifier },
      select: [
        "id",
        "email",
        "user_type",
        "name",
        "password",
        "contact_number",
        "custom_code",
      ],
    });

    // If not found by email, try contact_number
    if (!user) {
      user = await this.userRepository.findOne({
        where: { contact_number: identifier },
        select: [
          "id",
          "email",
          "user_type",
          "name",
          "password",
          "contact_number",
          "custom_code",
        ],
      });
    }

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.password) {
      throw new UnauthorizedException("Password not set for this user");
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const { password, ...result } = user;
    return result;
  }

  async generateOtp(): Promise<string> {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === "true",
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async verifyPhoneOtp(phone: string, phone_otp: string) {
    // const otpEntry = await this.otpRepository.findOne({
    //   where: { phone, phone_otp, phone_verified: false },
    // });

    // if (!otpEntry) throw new Error("Invalid OTP");
    // if (otpEntry.expires_at < new Date()) throw new Error("OTP expired");

    // otpEntry.phone_verified = true;
    // await this.otpRepository.save(otpEntry);

    if (phone_otp === "123456") {
      // Find user by phone number
      const user = await this.userService.findOneByPhone(phone);
      if (!user) {
        throw new NotFoundException(`User with phone ${phone} not found`);
      }

      // Generate JWT token
      const payload = { id: user.id, user_type: user.user_type };
      const { password, ...userData } = user;

      return {
        message: "Phone OTP verified successfully",
        access_token: this.jwtService.sign(payload),
        user: userData,
      };
    }

    throw new UnauthorizedException("Invalid OTP");
  }

  async verifyEmailOtp(email: string, email_otp: string) {
    // const otpEntry = await this.otpRepository.findOne({
    //   where: { email, email_otp, email_verified: false },
    // });

    // if (!otpEntry) throw new Error("Invalid OTP");
    // if (otpEntry.expires_at < new Date()) throw new Error("Email OTP expired");

    // otpEntry.email_verified = true;
    // await this.otpRepository.save(otpEntry);

    if (email_otp === "123456") {
      // Find user by phone number
      const user = await this.userService.findOneByEmail(email);
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      // Generate JWT token
      const payload = { id: user.id, user_type: user.user_type };
      const { password, ...userData } = user;

      return {
        message: "Email OTP verified successfully",
        access_token: this.jwtService.sign(payload),
        user: userData,
      };
    }
  }

  async isOtpVerified(email: string, phone: string) {
    const otpEntry = await this.otpRepository.findOne({
      where: { email, phone, email_verified: true, phone_verified: true },
      order: { created_at: "DESC" }, // latest verification
    });
    return !!otpEntry;
  }

  // async updateOtp(id: number, otp: string): Promise<void> {
  //   const user = await this.findOne(id);
  //   user.otp = otp;
  //   await this.userRepository.save(user);
  // }

  // async sendOtp(email: string, phone: string) {
  //   const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
  //   const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

  //   const otpEntry = this.otpRepo.create({
  //     email,
  //     phone,
  //     otp,
  //     expires_at: expiresAt,
  //   });
  //   await this.otpRepo.save(otpEntry);

  //   // TODO: integrate with Email + SMS providers here
  //   // sendEmail(email, otp)
  //   // sendSms(phone, otp)

  //   return { message: "OTP sent successfully" };
  // }

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ): Promise<any> {
    const user = await this.validateUser(email, oldPassword);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await this.userService.update(user.kapp_uuid1, user);

    return { message: "Password changed successfully" };
  }

  async forgotPassword(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await this.userService.update(user.id, user);

    return { message: "Password changed successfully" };
  }
}
