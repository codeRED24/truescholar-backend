import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsString,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCountryDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  created_at?: string;

  @IsOptional()
  updated_at?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value === undefined ? 0.0 : value))
  kapp_score: number;
}
