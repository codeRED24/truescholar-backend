import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { UserService } from "./users.service";
import { UpdateUserDto } from "./dto/update-users.dto";
import { ApiTags } from "@nestjs/swagger";
import { RegisterUserDto } from "./dto/register-users.dto";

@ApiTags("users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() createUserDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { user, isExisting } =
      await this.userService.registerUser(createUserDto);

    const responseData = {
      message: isExisting ? "User already exists" : "User created successfully",
      data: user,
    };

    // Set status code based on whether user is existing or new
    const statusCode = isExisting ? 200 : 201;
    res.status(statusCode);

    return responseData;
  }

  // @Get()
  // async findAll(@Query("username") username?: string) {
  //   const users = await this.userService.findAll(username);
  //   return {
  //     message: "Users retrieved successfully",
  //     data: users,
  //   };
  // }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    const user = await this.userService.findOne(id);
    return {
      message: `User with ID ${id} retrieved successfully`,
      data: user,
    };
  }

  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto) {
    const result = await this.userService.update(id, updateUserDto);
    return result;
  }

  @Delete(":id")
  async remove(@Param("id") id: number) {
    const result = await this.userService.remove(id);
    return result;
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
    const result = await this.userService.verifyEmailOtp(email, email_otp);
    return result;
  }

  @Post("verify-phone-otp")
  async verifyPhoneOtp(
    @Body() { phone, phone_otp }: { phone: string; phone_otp: string }
  ) {
    const result = await this.userService.verifyPhoneOtp(phone, phone_otp);
    return result;
  }

  @Get("is-otp-verified")
  async isOtpVerified(
    @Query("email") email: string,
    @Query("phone") phone: string
  ) {
    const verified = await this.userService.isOtpVerified(email, phone);
    return { verified };
  }
}
