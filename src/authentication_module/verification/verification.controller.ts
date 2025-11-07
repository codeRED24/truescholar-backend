import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { VerificationService } from "./verification.service";
import { RefreshAuthGuard } from "../auth/refresh-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import {
  SendVerificationDto,
  VerifyOtpDto,
  ResendVerificationDto,
  CheckVerificationStatusDto,
} from "./dto/verification.dto";
import { VerificationType } from "./verification.entity";
import { Request } from "express";

@ApiTags("verification")
@Controller("verification")
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post("send-otp")
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: "Send verification OTP" })
  @ApiResponse({ status: 201, description: "OTP sent successfully" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 409, description: "Already verified" })
  @ApiResponse({ status: 423, description: "Rate limited" })
  async sendVerificationOTP(@Body() sendVerificationDto: SendVerificationDto) {
    const { type, identifier } = sendVerificationDto;
    return this.verificationService.sendVerificationOTP(type, identifier);
  }

  @Post("verify-otp")
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: "Verify OTP" })
  @ApiResponse({ status: 200, description: "OTP verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid OTP" })
  @ApiResponse({ status: 404, description: "No pending verification" })
  @ApiResponse({ status: 410, description: "OTP expired" })
  @ApiResponse({ status: 423, description: "Max attempts reached" })
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto, @Req() req: Request) {
    const { type, identifier, otp } = verifyOtpDto;
    const clientIP = req.ip || req.connection.remoteAddress;
    return this.verificationService.verifyOTP(type, identifier, otp, clientIP);
  }

  @Post("resend-otp")
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: "Resend verification OTP" })
  @ApiResponse({ status: 201, description: "OTP resent successfully" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 409, description: "Already verified" })
  @ApiResponse({ status: 423, description: "Rate limited" })
  async resendVerificationOTP(
    @Body() resendVerificationDto: ResendVerificationDto
  ) {
    const { type, identifier } = resendVerificationDto;
    return this.verificationService.sendVerificationOTP(type, identifier);
  }

  @Post("check-status")
  @ApiOperation({ summary: "Check verification status" })
  @ApiResponse({ status: 200, description: "Status retrieved successfully" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  @ApiResponse({ status: 404, description: "User not found" })
  async checkVerificationStatus(
    @Body() checkStatusDto: CheckVerificationStatusDto
  ) {
    const { type, identifier } = checkStatusDto;
    return this.verificationService.checkVerificationStatus(type, identifier);
  }

  @Get("user/:userId/status")
  @UseGuards(RefreshAuthGuard)
  @ApiOperation({ summary: "Get user's verification status" })
  @ApiResponse({ status: 200, description: "User verification status" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserVerificationStatus(
    @Param("userId", ParseIntPipe) userId: number
  ) {
    return this.verificationService.getUserVerificationStatus(userId);
  }

  // Convenience endpoints for direct access
  @Post("send-email-otp")
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: "Send email verification OTP" })
  async sendEmailOTP(@Body() body: { identifier: string }) {
    return this.verificationService.sendVerificationOTP(
      VerificationType.EMAIL,
      body.identifier
    );
  }

  @Post("send-phone-otp")
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: "Send phone verification OTP" })
  async sendPhoneOTP(@Body() body: { identifier: string }) {
    return this.verificationService.sendVerificationOTP(
      VerificationType.PHONE,
      body.identifier
    );
  }

  @Post("verify-email-otp")
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: "Verify email OTP" })
  async verifyEmailOTP(
    @Body() body: { identifier: string; otp: string },
    @Req() req: Request
  ) {
    const clientIP = req.ip || req.connection.remoteAddress;
    return this.verificationService.verifyOTP(
      VerificationType.EMAIL,
      body.identifier,
      body.otp,
      clientIP
    );
  }

  @Post("verify-phone-otp")
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: "Verify phone OTP" })
  async verifyPhoneOTP(
    @Body() body: { identifier: string; otp: string },
    @Req() req: Request
  ) {
    const clientIP = req.ip || req.connection.remoteAddress;
    return this.verificationService.verifyOTP(
      VerificationType.PHONE,
      body.identifier,
      body.otp,
      clientIP
    );
  }
}
