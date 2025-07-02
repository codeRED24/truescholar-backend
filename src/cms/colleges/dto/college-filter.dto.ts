import { Transform, Type } from "class-transformer";
import { IsOptional, IsNumber, IsString, IsInt } from "class-validator";

export class CollegeFilterDto {
  @IsOptional()
  is_online?: boolean;

  @IsOptional()
  is_university?: boolean;

  @IsOptional()
  girls_only?: boolean;

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  college_name?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  college_id?: number;

  @IsOptional()
  type_of_institute?: string;

  @IsOptional()
  @IsString()
  state_name?: string;

  @IsOptional()
  @IsString()
  city_name?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Transform to number
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Transform to number
  limit?: number;
}

export class CollegeFilterDtoModified {
  @IsOptional()
  is_online?: boolean;

  @IsOptional()
  is_university?: boolean;

  @IsOptional()
  girls_only?: boolean;

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  college_name?: string;

  @IsOptional()
  type_of_institute?: string;

  @IsOptional()
  @IsString()
  state_name?: string;

  @IsOptional()
  @IsString()
  city_name?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  college_id?: number;
}
