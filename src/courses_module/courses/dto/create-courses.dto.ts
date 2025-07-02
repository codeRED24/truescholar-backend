import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsNumber,
  Validate,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";
import { CourseLevel } from "../../../common/enums";

export class CreateCourseDto {
  @ApiProperty({ description: "Name of the course" })
  @IsString()
  course_name: string;

  @ApiProperty({ description: "Slug for the course" })
  @IsString()
  @Validate(SlugValidator)
  slug: string;

  @ApiProperty({ description: "Last edited by", required: false })
  @IsOptional()
  @IsString()
  last_edited_by?: string;

  @ApiProperty({ description: "Is the course online?", required: false })
  @IsOptional()
  @IsBoolean()
  is_online?: boolean;

  @ApiProperty({ description: "Course short name", required: false })
  @IsOptional()
  @IsString()
  short_name?: string;

  @ApiProperty({ description: "Description of the course", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Course duration", required: false })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({ description: "Last update date", required: false })
  @IsOptional()
  @IsDateString()
  last_update?: string;

  @ApiProperty({
    description: "Is the course active?",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiProperty({ description: "Is the course approved?", required: false })
  @IsOptional()
  @IsBoolean()
  is_approved?: boolean;

  @ApiProperty({ description: "Course code", required: false })
  @IsOptional()
  @IsString()
  course_code?: string;

  @ApiProperty({ description: "Is the course online only?", required: false })
  @IsOptional()
  @IsBoolean()
  online_only?: boolean;

  @ApiProperty({
    description: "Is the is_integrated_course?",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_integrated_course?: boolean;

  @ApiProperty({ description: "Kapscore 1", required: false })
  @IsOptional()
  @IsNumber()
  kap_score?: number;

  @ApiProperty({ description: "kap_score", required: false })
  @IsOptional()
  @IsString()
  course_format?: string;

  @ApiProperty({ description: "specialization_id", required: false })
  @IsOptional()
  @IsNumber()
  specialization_id?: number;

  @ApiProperty({ description: "specialization_id", required: false })
  @IsOptional()
  @IsNumber()
  course_group_id: number;

  @ApiProperty({ description: "degree_type", required: false })
  @IsOptional()
  @IsString()
  degree_type?: string;

  @ApiProperty({ description: "eligibilit creteria", required: false })
  @IsOptional()
  @IsString()
  eligibility?: string;

  @ApiProperty({
    description: "Course level",
    required: false,
    enum: CourseLevel,
  })
  @IsOptional()
  @IsString()
  level?: CourseLevel;

  @ApiProperty({ description: "Key article", required: false })
  @IsOptional()
  @IsNumber()
  key_article?: number;
}
