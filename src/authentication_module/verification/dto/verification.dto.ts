import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { VerificationType } from "../verification.entity";

export class SendVerificationDto {
  @ApiProperty({
    description: "Type of verification (email or phone)",
    enum: VerificationType,
    example: VerificationType.EMAIL,
  })
  @IsEnum(VerificationType)
  type: VerificationType;

  @ApiProperty({
    description: "Email address or phone number",
    example: "user@example.com",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9@._+-]+$/, { message: "Invalid identifier format" })
  @Length(3, 100, {
    message: "Identifier must be between 3 and 100 characters",
  })
  identifier: string; // email or phone number
}

export class VerifyOtpDto {
  @ApiProperty({
    description: "Type of verification (email or phone)",
    enum: VerificationType,
    example: VerificationType.EMAIL,
  })
  @IsEnum(VerificationType)
  type: VerificationType;

  @ApiProperty({
    description: "Email address or phone number",
    example: "user@example.com",
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    description: "One-time password",
    minLength: 6,
    maxLength: 6,
    example: "123456",
  })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: "OTP must contain only 6 digits" })
  otp: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: "Type of verification (email or phone)",
    enum: VerificationType,
    example: VerificationType.EMAIL,
  })
  @IsEnum(VerificationType)
  type: VerificationType;

  @ApiProperty({
    description: "Email address or phone number",
    example: "user@example.com",
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;
}

export class CheckVerificationStatusDto {
  @ApiProperty({
    description: "Type of verification (email or phone)",
    enum: VerificationType,
    example: VerificationType.EMAIL,
  })
  @IsEnum(VerificationType)
  type: VerificationType;

  @ApiProperty({
    description: "Email address or phone number",
    example: "user@example.com",
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;
}
