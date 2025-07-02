import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  Validate,
  IsInt,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";
import { DurationType, CourseType, CourseMode, CourseLevels } from "../../../common/enums";

export class CreateCourseDto {

  @ApiProperty({
    description: "Is the course active?",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiProperty({ description: "Name of the course" })
  @IsString()
  course_name: string;

  @ApiProperty({ description: "Course short name", required: false })
  @IsOptional()
  @IsString()
  short_name?: string;

  @ApiProperty({ description: "Is the course online only?", required: false })
  @IsOptional()
  @IsBoolean()
  online_only?: boolean;

  @ApiProperty({ description: "Slug for the course" })
  @IsString()
  @Validate(SlugValidator)
  slug: string;

  @ApiProperty({ description: "Course duration in months/other format", required: false })
  @IsOptional()
  @IsNumber()
  duration_value?: number;  // This should be duration_value

  @ApiProperty({ description: "Duration Type", required: false })
  @IsOptional()
  @IsString()
  duration_type?: DurationType;

  @ApiProperty({ description: "Course Type", required: false })
  @IsOptional()
  @IsString()
  course_type?: CourseType;

  @ApiProperty({ description: "Course Mode", required: false })
  @IsOptional()
  @IsString()
  course_mode?: CourseMode;

  @ApiProperty({ description: "Course Level", required: false })
  @IsOptional()
  @IsString()
  course_level?: CourseLevels;

  @ApiProperty({ description: "Kapscore 1", required: false })
  @IsOptional()
  @IsNumber()
  kap_score?: number;

  @ApiProperty({
    description: "Is the is_integrated_course?",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_integrated_course?: boolean;

  @ApiProperty({ description: "Eligibility criteria", required: false })
  @IsOptional()
  @IsString()
  eligibility?: string;

  @ApiProperty({ description: "Specialization ID", required: false })
  @IsOptional()
  @IsNumber()
  specialization_id?: number;

  @ApiProperty({ description: "Course Group ID", required: false })
  @IsOptional()
  @IsNumber()
  course_group_id?: number;

  @IsOptional()
  @Type(() => Number) // Transform the input into a number
  @IsInt({ message: "Stream Id application must be a valid integer" }) // Ensure it's an integer
  stream_id?: number;

}
