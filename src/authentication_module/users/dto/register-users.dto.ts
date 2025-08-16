import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsNumber,
  IsDateString,
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

  @ApiProperty({ description: "College id (int)", required: false })
  @IsOptional()
  @IsNumber()
  college_id?: number;

  @ApiProperty({ description: "Course id (int)", required: false })
  @IsOptional()
  @IsNumber()
  course_id?: number;

  @ApiProperty({ description: "College location", required: false })
  @IsOptional()
  @IsString()
  college_location?: string;

  @ApiProperty({ description: "User location", required: false })
  @IsOptional()
  @IsString()
  user_location?: string;

  @ApiProperty({ description: "Passing year", required: false })
  @IsOptional()
  @IsNumber()
  pass_year?: number;

  @ApiProperty({ description: "Date of birth", required: false })
  @IsOptional()
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
}
