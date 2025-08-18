import { Controller, Post, Body, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";
import { UserService } from "../../authentication_module/users/users.service";
import { CreateUserDto } from "../../authentication_module/users/dto/create-users.dto";
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post("signup")
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      message: "User signed up successfully",
      data: user,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post("verify-otp")
  async verifyOtp(@Body() { email, otp }: { email: string; otp: string }) {
    return this.authService.verifyOtp(email, otp);
  }

  @Post("resend-otp")
  async resendOtp(
    @Body() { email, reason }: { email: string; reason: string }
  ) {
    return this.authService.resendOtp(email, reason);
  }
  @Post("forgot-password")
  async forgotPassword(@Body() { email }: { email: string }) {
    return this.authService.forgotPassword(email);
  }

  @Post("change-password")
  async changePassword(
    @Body()
    {
      email,
      oldPassword,
      newPassword,
    }: {
      email: string;
      oldPassword: string;
      newPassword: string;
    }
  ) {
    return this.authService.changePassword(email, oldPassword, newPassword);
  }
}
