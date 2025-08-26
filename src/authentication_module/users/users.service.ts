import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { User } from "./users.entity";
import { UpdateUserDto } from "./dto/update-users.dto";
import * as dotenv from "dotenv";
import { OtpRequest } from "./user-otp.entity";
import { RegisterUserDto } from "./dto/register-users.dto";

dotenv.config();
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASSWORD:", process.env.SMTP_PASSWORD);

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OtpRequest)
    private readonly otpRepository: Repository<OtpRequest>
  ) {}

  // GET ALL
  // async findAll(username?: string): Promise<User[]> {
  //   if (username) {
  //     return this.userRepository.find({
  //       where: {
  //         name: Like(`%${username}%`),
  //       },
  //     });
  //   }
  //   return this.userRepository.find();
  // }

  // GET /users/:id
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // Create a new user record
  async registerUser(
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

    const user = this.userRepository.create(payload as User);

    try {
      const savedUser = await this.userRepository.save(user);
      return { user: savedUser, isExisting: false };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException(
          "custom_code or unique constraint violated"
        );
      }
      throw error;
    }
  }

  // PATCH /users/:id
  async update(
    id: number,
    updateUserDto: UpdateUserDto
  ): Promise<{ message: string; data?: User }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.update(id, updateUserDto);
    const updatedUser = await this.findOne(id);

    return {
      message: `User with ID ${id} updated successfully`,
      data: updatedUser,
    };
  }

  // DELETE /users/:id
  async remove(id: number): Promise<{ message: string }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.delete(id);
    return {
      message: `User with ID ${id} deleted successfully`,
    };
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
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

  async verifyPhoneOtp(phone: string, phone_otp: string) {
    // const otpEntry = await this.otpRepository.findOne({
    //   where: { phone, phone_otp, phone_verified: false },
    // });

    // if (!otpEntry) throw new Error("Invalid OTP");
    // if (otpEntry.expires_at < new Date()) throw new Error("OTP expired");

    // otpEntry.phone_verified = true;
    // await this.otpRepository.save(otpEntry);

    if (phone_otp === "123456")
      return { message: "Phone OTP verified successfully" };
  }

  async verifyEmailOtp(email: string, email_otp: string) {
    // const otpEntry = await this.otpRepository.findOne({
    //   where: { email, email_otp, email_verified: false },
    // });

    // if (!otpEntry) throw new Error("Invalid OTP");
    // if (otpEntry.expires_at < new Date()) throw new Error("Email OTP expired");

    // otpEntry.email_verified = true;
    // await this.otpRepository.save(otpEntry);

    if (email_otp === "123456")
      return { message: "Email OTP verified successfully" };
  }

  async isOtpVerified(email: string, phone: string) {
    const otpEntry = await this.otpRepository.findOne({
      where: { email, phone, email_verified: true, phone_verified: true },
      order: { created_at: "DESC" }, // latest verification
    });
    return !!otpEntry;
  }
}
