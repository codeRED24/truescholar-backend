import { Transform, Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class ExamFilterDTO {
  @IsOptional()
  @IsString()
  is_active?: string;

  @IsOptional()
  @IsString()
  exam_name?: string;

  @IsOptional()
  @IsString()
  mode_of_exam?: string;

  @IsOptional()
  @IsString()
  exam_method?: string;

  @IsOptional()
  @IsString()
  application_mode?: string;

  @IsOptional()
  @IsString()
  stream_name?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  exam_id?: number;
}
