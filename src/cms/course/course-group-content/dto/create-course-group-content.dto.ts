import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class createCourseGroupContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  author_id?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  is_active?: boolean;

  @IsOptional()
  @IsString()
  refrence_url?: string;

  @IsOptional()
  @IsString()
  meta_desc?: string;

  @IsOptional()
  @IsString()
  seo_param?: string;

  @IsOptional()
  @IsString()
  og_title?: string;

  @IsOptional()
  @IsString()
  og_description?: string;

  @IsOptional()
  @IsString()
  og_featured_img?: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  course_group_id: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  college_id: number;
}
