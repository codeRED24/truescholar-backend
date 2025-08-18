import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../authentication_module/users/users.service";
import * as nodemailer from "nodemailer";
import * as bcrypt from "bcrypt";
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  // async validateUser(username: string, pass: string): Promise<any> {
  //   const user = await this.userService.validateUser(username, pass);
  //   if (user) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   throw new UnauthorizedException("Invalid credentials");
  // }

  async login(user: any) {
    const payload = { username: user.username, sub: user.kapp_uuid1 };
    return {
      access_token: this.jwtService.sign(payload),
    };
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

  // async verifyOtp(email: string, otp: string): Promise<any> {
  //   const user = await this.userService.findOneByEmail(email);
  //   if (!user || user.otp !== otp) {
  //     throw new UnauthorizedException("Invalid OTP");
  //   }

  //   user.otp_verified = true;
  //   await this.userService.update(user.kapp_uuid1, user);
  //   return { message: "OTP verified successfully" };
  // }

  // async resendOtp(email: string, reason: string): Promise<any> {
  //   const user = await this.userService.findOneByEmail(email);
  //   if (!user) {
  //     throw new NotFoundException("User not found");
  //   }

  //   const otp = await this.generateOtp();
  //   user.otp = otp;
  //   await this.userService.update(user.kapp_uuid1, user);

  //   await this.sendOtpEmail(email, otp);

  //   return { message: `OTP resent for ${reason}` };
  // }

  // async forgotPassword(email: string): Promise<any> {
  //   const user = await this.userService.findOneByEmail(email);
  //   if (!user) {
  //     throw new NotFoundException("User not found");
  //   }

  //   const otp = await this.generateOtp();
  //   user.otp = otp;
  //   await this.userService.update(user.kapp_uuid1, user);

  //   await this.sendOtpEmail(email, otp);

  //   return { message: "OTP sent to reset password" };
  // }

  // async changePassword(
  //   email: string,
  //   oldPassword: string,
  //   newPassword: string
  // ): Promise<any> {
  //   const user = await this.userService.validateUser(email, oldPassword);
  //   if (!user) {
  //     throw new UnauthorizedException("Invalid credentials");
  //   }

  //   const salt = await bcrypt.genSalt();
  //   const hashedPassword = await bcrypt.hash(newPassword, salt);

  //   user.password = hashedPassword;
  //   await this.userService.update(user.kapp_uuid1, user);

  //   return { message: "Password changed successfully" };
  // }
}
