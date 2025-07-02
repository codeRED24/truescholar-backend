import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  Length,
  IsString,
  IsNumber,
  IsEnum,
} from "class-validator";
import { GenderType } from "../../../common/enums";
import { QuotaType } from "../../../common/enums";

export class CreateCollegeCutoffDto {
  @ApiProperty({ description: "College ID" })
  @IsNotEmpty()
  @IsNumber()
  college_id?: number;

  @ApiProperty({ description: "Exam ID" })
  @IsNotEmpty()
  @IsNumber()
  exam_id?: number;

  @ApiProperty({ description: "Year" })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ description: "College Course ID" })
  @IsOptional()
  college_wise_course_id?: number;

  @ApiProperty({ description: "Category" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: "course_full_name" })
  @IsOptional()
  @IsString()
  course_full_name?: string;

  @ApiProperty({ description: "Cutoff Score" })
  @IsOptional()
  @IsNumber()
  cutoff_score?: number;

  @ApiProperty({ description: "Cutoff Score", type: Number })
  @IsOptional()
  @IsNumber({}, { message: "Cutoff score must be a valid number" })
  cutoff_score_decimal?: number;
  
  @ApiProperty({ description: "Opening Rank Score" })
  @IsOptional()
  @IsNumber()
  opening_rank?: number;

  @ApiProperty({ description: "Closing Rank Score" })
  @IsOptional()
  @IsNumber()
  closing_rank?: number;

  @ApiProperty({
    description: "Quota",
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  Quota?: string;

  @ApiProperty({
    description: "Gender",
    enum: GenderType,
    required: false,
  })
  @IsOptional()
  @IsEnum(GenderType)
  gender?: GenderType;

  @ApiProperty({ description: "Cutoff Round" })
  @IsOptional()
  @IsString()
  cutoff_type?: string;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;

  @ApiProperty({ description: "silos", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  silos?: string;

  @ApiProperty({ description: "Region", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  region?: string;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  round?: string;

  @ApiProperty({ description: "Course Group ID", required: false })
  @IsOptional()
  @IsNumber()
  course_group_id?: number;




}

//silos-varchar(100)
//cutoff_score-decimal
