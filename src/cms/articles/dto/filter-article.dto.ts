import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from "class-validator";
import { StatusType } from "../../../common/enums";

export class filterArticleDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsEnum(StatusType)
  status?: StatusType;

  @IsOptional()
  author_name?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Transform to number
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) // Transform to number
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) 
  @IsInt()
  article_id?: number;
}
