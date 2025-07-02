import { IsNotEmpty, IsOptional, IsBoolean, IsString, IsNumber } from "class-validator";

export class CreateListingContentDto {
  @IsNotEmpty()
  custom_id: string;

  @IsNotEmpty()
  title: string;

  @IsOptional()
  meta_desc?: string;

  @IsOptional()
  seo_param?: string;

  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  city_id: number;

  @IsOptional()
  @IsNumber()
  state_id: number;

  @IsOptional()
  @IsNumber()
  stream_id: number;

  @IsOptional()
  @IsNumber()
  course_group_id: number;
}

export class FilterListingContentDto {
  @IsOptional()
  @IsNumber()
  city_id?: number;

  @IsOptional()
  @IsNumber()
  state_id?: number;

  @IsOptional()
  @IsNumber()
  course_group_id?: number;

  @IsOptional()
  @IsNumber()
  stream_id?: number;
}