import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  Validate,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateStreamDto {
  @ApiProperty()
  @IsNotEmpty()
  stream_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  updated_at?: string;

  @IsString()
  @Validate(SlugValidator)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  key_article?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  kapp_score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_online?: boolean;
}
