import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  Length,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFacultiesDto {
  @IsOptional()
  @IsString()
  faculty_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 100)
  degree: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  experience_years: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 100)
  department: string;

  @ApiProperty({
    description: "College ID associated with the content",
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  college_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  specialization?: number;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;
}
