import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsEnum,
  Length,
  IsInt,
  Min,
  IsOptional,
} from "class-validator";
import { Transform } from "class-transformer";
import { UserRole } from "../auth.entity";

export class CreateUserDto {
  @ApiProperty({ description: "Email of the user", required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Username of the user", required: true })
  @IsString()
  @Length(2, 100) // Add length constraints for better validation
  name: string;

  @ApiProperty({ description: "Password for the user", required: true })
  @IsString()
  @IsNotEmpty()
  @Length(6, 50) // Password length validation
  password: string;

  @ApiProperty({
    description: "Role of the user (admin, editor, author)",
    enum: UserRole,
    required: true,
  })
  @IsEnum(UserRole, {
    message: `Role must be one of the following: ${Object.values(UserRole).join(", ")}`,
  })
  role: UserRole;

  @IsOptional()
  @IsString()
  view_name?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  image?: string;

  is_active?: boolean;
}

export class UpdateUserDto {
  @ApiProperty({ description: "Email of the user", required: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: "Username of the user", required: true })
  @IsString()
  @Length(2, 100) // Add length constraints for better validation
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "Password for the user", required: true })
  @IsString()
  @IsNotEmpty()
  @Length(6, 50) // Password length validation
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: "Role of the user (admin, editor, author)",
    enum: UserRole,
    required: true,
  })
  @IsEnum(UserRole, {
    message: `Role must be one of the following: ${Object.values(UserRole).join(", ")}`,
  })
  @IsOptional()
  role?: UserRole;
}

export class LoginUserDto {
  @ApiProperty({ description: "Email of the user", required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Password for the user", required: true })
  @IsString()
  @IsNotEmpty()
  @Length(6, 50) // Password length validation
  password: string;
}

export class UserIdDto {
  @Transform(({ value }) => parseInt(value, 10)) // Transform the value to an integer
  @IsInt({ message: "userId must be an integer" }) // Ensure the value is an integer
  @Min(1, { message: "userId must be a positive number" }) // Ensure the value is positive
  userId: number;
}

export class PaginationDto {
  @ApiProperty({
    description: "Page number for pagination",
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: "Page must be an integer." })
  @Min(1, { message: "Page must be at least 1." })
  page?: number;

  @ApiProperty({
    description: "Number of items per page",
    required: false,
    example: 10,
  })
  @IsOptional()
  @IsInt({ message: "Limit must be an integer." })
  @Min(1, { message: "Limit must be at least 1." })
  limit?: number;

  @ApiProperty({ description: "Username of the user", required: true })
  @IsString()
  @Length(2, 100) // Add length constraints for better validation
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "Role of the user (admin, editor, author)",
    enum: UserRole,
    required: true,
  })
  @IsEnum(UserRole, {
    message: `Role must be one of the following: ${Object.values(UserRole).join(", ")}`,
  })
  @IsOptional()
  role?: UserRole;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh token for refreshing the access token.",
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
