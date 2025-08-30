import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  MinLength,
} from "class-validator";

export class RegisterUserDto {
  @ApiProperty({ description: "The custom code of the user", required: false })
  @IsOptional()
  @IsString()
  custom_code?: string;

  @ApiProperty({ description: "Name of the user" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Email ID of the user", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: "Gender of the user", required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: "Contact number of the user", required: false })
  @IsOptional()
  @IsString()
  contact_number?: string;

  @ApiProperty({ description: "Country of origin", required: false })
  @IsOptional()
  @IsString()
  country_of_origin?: string;

  @ApiProperty({ description: "College roll number", required: false })
  @IsOptional()
  @IsString()
  college_roll_number?: string;

  @ApiProperty({ description: "User location", required: false })
  @IsOptional()
  @IsString()
  user_location?: string;

  @ApiProperty({
    description: "Date of birth",
    required: false,
    example: "2000-01-01",
  })
  @IsDateString()
  dob?: string;

  @ApiProperty({ description: "User type", required: false })
  @IsOptional()
  @IsString()
  user_type?: string;

  @ApiProperty({ description: "User image url", required: false })
  @IsOptional()
  @IsString()
  user_img_url?: string;

  @ApiProperty({ description: "User password", required: false })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password?: string;

  @ApiProperty({ description: "Referral code", required: false })
  @IsOptional()
  @IsString()
  referred_by?: string;

  @ApiProperty({ description: "College name", required: false })
  @IsOptional()
  @IsString()
  college?: string;
}
