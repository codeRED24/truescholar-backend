import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Validate,
  IsEnum,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";
import { CourseType } from "../../../common/enums";
import { CourseLevel } from "../../../common/enums";

export class CreateCourseGroupDto {
  @ApiProperty({ description: "Slug for the course group" })
  @IsString()
  @Validate(SlugValidator)
  slug?: string;

  @ApiProperty({
    description: "Indicates if the course group is active",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @ApiProperty({ description: "Description of the course", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Kapp score of the course group",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  kapp_score?: number;

  @ApiProperty({ description: "Name of the course group" })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Full name of the course group",
    required: false,
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({
    description: "Type of course group",
    enum: CourseType,
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseType)
  type?: CourseType;

  @ApiProperty({
    description: "Level of the course group",
    enum: CourseLevel,
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiProperty({ description: "Duration in months", required: false })
  @IsOptional()
  @IsNumber()
  duration_in_months?: number;

  @ApiProperty({
    description: "Stream ID associated with the course group",
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  stream_id?: number;
}
