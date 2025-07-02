import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsNumber,
  IsBoolean,
} from "class-validator";

export class CreateCollegeWiseFeesDto {
  @ApiProperty({
    description: "Indicates if the fees are active",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: "College ID associated with the content",
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  college_id?: number;

  @ApiProperty({ description: "Kapp score", required: false })
  @IsOptional()
  @IsNumber()
  kapp_score?: number;

  @ApiProperty({ description: "Total minimum fees", required: false })
  @IsOptional()
  @IsNumber()
  total_min_fees?: number;

  @ApiProperty({ description: "fees", required: false })
  @IsOptional()
  @IsNumber()
  fees?: number;

  @ApiProperty({ description: "fees", required: false })
  @IsOptional()
  @IsNumber()
  min_one_time_fees?: number;

  @ApiProperty({ description: "fees", required: false })
  @IsOptional()
  @IsNumber()
  max_one_time_fees?: number;

  @ApiProperty({ description: "fees", required: false })
  @IsOptional()
  @IsNumber()
  max_hostel_fees?: number;

  @ApiProperty({ description: "fees", required: false })
  @IsOptional()
  @IsNumber()
  min_hostel_fees?: number;

  @ApiProperty({ description: "fees", required: false })
  @IsOptional()
  @IsNumber()
  min_other_fees?: number;

  @ApiProperty({ description: "fees", required: false })
  @IsOptional()
  @IsNumber()
  max_other_fees?: number;

  @ApiProperty({ description: "Salary", required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ description: "Total maximum fees", required: false })
  @IsOptional()
  @IsNumber()
  total_max_fees?: number;

  @ApiProperty({ description: "Tuition fees minimum amount", required: false })
  @IsOptional()
  @IsNumber()
  tution_fees_min_amount?: number;

  @ApiProperty({ description: "Tuition fees maximum amount", required: false })
  @IsOptional()
  @IsNumber()
  tution_fees_max_amount?: number;

  @ApiProperty({ description: "Description of tuition fees", required: false })
  @IsOptional()
  @IsString()
  tution_fees_description?: string;

  @ApiProperty({ description: "Other fees", required: false })
  @IsOptional()
  @IsString()
  other_fees?: string;

  @ApiProperty({ description: "Year of the fees", required: false })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({
    description: "Quota applicable for the fees",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  quota?: string;

  @ApiProperty({
    description: "Quota applicable for the fees",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  duration?: string;

  @ApiProperty({ description: "College wise Course ID", required: false })
  @IsOptional()
  collegewise_course_id?: number;

  @ApiProperty({ description: "College wise Course ID", required: false })
  @IsOptional()
  course_group_id?: number;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;
}
