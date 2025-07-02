import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateNewsletterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mobile_no: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  response_url: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  location: string;
}
