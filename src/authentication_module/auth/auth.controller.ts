import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Res,
  Get,
  Query,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";
import { RegisterUserDto } from "./dto/register-users.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async create(
    @Body() createUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { user, isExisting } = await this.authService.create(createUserDto);

    const responseData = {
      message: isExisting ? "User already exists" : "User created successfully",
      data: user,
    };

    // Set status code based on whether user is existing or new
    const statusCode = isExisting ? 200 : 201;
    res.status(statusCode);

    return responseData;
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post("change-password")
  async changePassword(
    @Body()
    {
      email,
      newPassword,
      oldPassword,
    }: {
      email: string;
      oldPassword: string;
      newPassword: string;
    }
  ) {
    return this.authService.changePassword(email, oldPassword, newPassword);
  }

  @Post("forgot-password")
  async forgotPassword(
    @Body()
    { email, password }: { email: string; password: string }
  ) {
    return this.authService.forgotPassword(email, password);
  }

  @Post("send-email-otp")
  async sendEmailOtp(@Body() { email }: { email: string }) {
    // For now, just return success message without actually sending
    return { message: "Email OTP sent successfully" };
  }

  @Post("send-phone-otp")
  async sendPhoneOtp(
    @Body() { phone, countryCode }: { phone: string; countryCode?: string }
  ) {
    // For now, just return success message without actually sending
    return { message: "Phone OTP sent successfully" };
  }

  @Post("verify-email-otp")
  async verifyEmailOtp(
    @Body() { email, email_otp }: { email: string; email_otp: string }
  ) {
    const result = await this.authService.verifyEmailOtp(email, email_otp);
    return result;
  }

  @Post("verify-phone-otp")
  async verifyPhoneOtp(
    @Body() { phone, phone_otp }: { phone: string; phone_otp: string }
  ) {
    const result = await this.authService.verifyPhoneOtp(phone, phone_otp);
    return result;
  }

  @Get("is-otp-verified")
  async isOtpVerified(
    @Query("email") email: string,
    @Query("phone") phone: string
  ) {
    const verified = await this.authService.isOtpVerified(email, phone);
    return { verified };
  }
}
