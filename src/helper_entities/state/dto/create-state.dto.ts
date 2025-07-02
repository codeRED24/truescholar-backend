import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsString,
  IsNumber,
  Validate,
} from 'class-validator';
import { SlugValidator } from '../../../common/Validators/slug-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStateDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  updated_at?: string;

  @ApiProperty()
  @IsString()
  @Validate(SlugValidator)
  slug?: string;

  @ApiProperty()
  @IsString()
  @IsNumber()
  @IsOptional()
  kapp_score?: number;

  @ApiPropertyOptional()
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_active: boolean;

  @IsNumber()
  country: number;
}
