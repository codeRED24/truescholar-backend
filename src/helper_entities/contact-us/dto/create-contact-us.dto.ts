import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateContactUsDto {

  @ApiProperty({ description: "Name" })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ description: "Role" })
  @IsOptional()
  @IsString()
  role: string;

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
  query: string;

  @ApiProperty()
  @IsString()
  response_url: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  course_group_id: number;
}
