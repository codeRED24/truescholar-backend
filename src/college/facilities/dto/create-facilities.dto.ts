import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  Length,
  IsString,
  IsNumber,
  Validate,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFacilitiesDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(0, 100)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Validate(SlugValidator)
  @Length(0, 300)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  meta_desc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_edited_by?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  og_img?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  og_title?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  priority_rank: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  priority_bool: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  card_img_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  img_arr?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  IsPublished: boolean;
}
