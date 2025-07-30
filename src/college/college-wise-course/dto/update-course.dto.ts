import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsEnum,
} from "class-validator";
import { Category, Type } from "../../../common/enums";

export class UpdateSingleCourseDto {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  top_recruiters?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNumber()
  total_seats?: number;

  @IsOptional()
  @IsString()
  eligibility?: string;

  @IsOptional()
  @IsUrl()
  refrence_url?: string;

  @IsOptional()
  @IsNumber()
  kapp_rating?: number;

  @IsOptional()
  @IsString()
  display_name?: string;

  @IsOptional()
  @IsString()
  course_name?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  // @IsOptional()
  // @IsNumber()
  // tution_fees?: number;

  // @IsOptional()
  // @IsNumber()
  // hostel_fees?: number;

  // @IsOptional()
  // @IsNumber()
  // admission_fees?: number;

  // @IsOptional()
  // @IsNumber()
  // exam_fees?: number;

  @IsOptional()
  @IsNumber()
  other_fees?: number;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsEnum(Type)
  type?: Type;
}
