import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Validate,
  IsBoolean,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";
export class CreateCityDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  created_at?: string;

  @IsOptional()
  updated_at?: string;

  @IsString()
  @Validate(SlugValidator)
  slug: string;

  @IsString()
  @IsOptional()
  logo_url: string;

  @IsNumber()
  state: number;

  @IsNumber()
  country: number;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsNumber()
  @IsOptional()
  kapp_score?: number;
}
