import { Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDecimal,
  IsEmail,
  IsUrl,
  IsInt,
  MaxLength,
  Validate,
  IsEnum,
  IsObject,
} from "class-validator";
import {
  ExamCategory,
  ExamLevel,
  ExamRecognize,
  ExamSubCategory,
} from "../../../common/exam.enums";
import { Transform } from "class-transformer";
import { SlugValidator } from "../../../common/Validators/slug-validator";

export class CreateExamCMSDto {
  @Transform(({ value }) =>
    value === "true" ? true : value === "false" ? false : value
  )
  @IsBoolean()
  @IsOptional()
  is_active?: string;

  @IsString()
  @IsNotEmpty()
  exam_name: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  exam_duration?: number;

  @IsString()
  @IsOptional()
  exam_subject?: string;

  @IsString()
  @IsOptional()
  mode_of_exam?: string;

  @IsString()
  @IsOptional()
  level_of_exam?: string;

  @IsDecimal()
  @IsOptional()
  kapp_score?: number;

  @IsString()
  @IsOptional()
  @Validate(SlugValidator)
  slug?: string;

  @IsString()
  @IsOptional()
  Application_process?: string;

  @IsDecimal()
  @IsOptional()
  exam_fee_min?: string;

  @IsDecimal()
  @IsOptional()
  exam_fee_max?: string;

  @IsString()
  @IsOptional()
  exam_shortname?: string;

  @IsUrl()
  @IsOptional()
  application_link?: string;

  @IsUrl()
  @IsOptional()
  official_website?: string;

  @IsEmail()
  @IsOptional()
  official_email?: string;

  @IsString()
  @IsOptional()
  official_mobile?: string;

  @IsOptional()
  @Type(() => Number) // Transform the input into a number
  @IsInt({ message: "Number of application must be a valid integer" }) // Ensure it's an integer
  no_of_application?: number;

  @IsString()
  @IsOptional()
  eligibilty_criteria?: string;

  @IsString()
  @IsOptional()
  eligibilty_description?: string;

  @IsString()
  @IsOptional()
  exam_method?: string;

  @IsString()
  @IsOptional()
  conducting_authority?: string;

  @IsString()
  @IsOptional()
  application_mode?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  refrence_url?: string;

  @IsOptional()
  @Type(() => Number) // Transform the input into a number
  @IsInt({ message: "Stream Id application must be a valid integer" }) // Ensure it's an integer
  stream_id?: number;

  // @IsEnum(ExamCategory)
  // exam_category: ExamCategory;

  // @IsOptional()
  // @IsEnum(ExamSubCategory)
  // exam_sub_category?: ExamSubCategory;

  // @IsOptional()
  // @Transform(({ value }) => parseInt(value, 10))
  // @IsInt()
  // parent_exam_id?: number;

  // @IsEnum(ExamRecognize)
  // exam_recognize: ExamRecognize;

  // @IsOptional()
  // @IsString()
  // exam_recognize_state?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value; // Return as is if parsing fails
      }
    }
    return value;
  })
  @IsObject()
  category_wise_fees?: Record<string, number>;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value; // Return as is if parsing fails
      }
    }
    return value;
  })
  @IsObject()
  course_slug?: Record<string, any>;

  @IsOptional()
  @IsString()
  parent_cutoff_category?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  frequency?: string;

  // @IsOptional()
  // @IsEnum(ExamLevel)
  // exam_level?: ExamLevel;
}
