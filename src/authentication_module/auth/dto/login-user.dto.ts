import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
} from "class-validator";

export class LoginUserDto {
  @ApiProperty({ description: "Email ID of the user" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "Password of the user" })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;
}
