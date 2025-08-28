import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEmail } from "class-validator";

export class LoginUserDto {
  @ApiProperty({ description: "Email ID of the user", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: "Contact number of the user", required: false })
  @IsOptional()
  @IsString()
  contact_number?: string;
}
