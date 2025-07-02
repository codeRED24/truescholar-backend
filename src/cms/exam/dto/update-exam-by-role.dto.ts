import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDecimal,
  IsDateString,
  IsEmail,
  IsUrl,
  IsInt,
  MaxLength,
  Validate,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";

export class UpdateExamByRoleDTO {
  @IsBoolean()
  @IsOptional()
  is_active?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  exam_name: string;

  @IsString()
  @IsOptional()
  last_edited_by?: string;

  @IsNumber()
  @IsOptional()
  exam_duration?: number;

  @IsString()
  @IsOptional()
  exam_subject?: string;

  @IsString()
  @IsOptional()
  exam_description?: string;

  @IsString()
  @IsOptional()
  mode_of_exam?: string;

  @IsString()
  @IsOptional()
  level_of_exam?: string;

  @IsDecimal()
  @IsOptional()
  kapp_score?: number;

  @IsString()
  @IsOptional()
  @Validate(SlugValidator)
  slug?: string;

  @IsString()
  @IsOptional()
  meta_desc?: string;

  @IsString()
  @IsOptional()
  exam_info?: string;

  @IsString()
  @IsOptional()
  Application_process?: string;

  @IsDecimal()
  @IsOptional()
  exam_fee_min?: string;

  @IsDecimal()
  @IsOptional()
  exam_fee_max?: string;

  @IsString()
  @IsOptional()
  exam_shortname?: string;

  @IsUrl()
  @IsOptional()
  application_link?: string;

  @IsUrl()
  @IsOptional()
  official_website?: string;

  @IsEmail()
  @IsOptional()
  official_email?: string;

  @IsString()
  @IsOptional()
  official_mobile?: string;

  @IsInt()
  @IsOptional()
  no_of_application?: number;

  @IsDateString()
  @IsOptional()
  last_update?: Date;

  @IsString()
  @IsOptional()
  eligibilty_criteria?: string;

  @IsString()
  @IsOptional()
  eligibilty_description?: string;

  @IsString()
  @IsOptional()
  exam_method?: string;

  @IsString()
  @IsOptional()
  conducting_authority?: string;

  @IsString()
  @IsOptional()
  application_mode?: string;

  @IsBoolean()
  @IsOptional()
  IsPublished?: boolean;

  @IsInt()
  @IsOptional()
  key_article?: number;

  @IsUrl()
  @IsOptional()
  exam_logo?: string;

  @IsDateString()
  @IsOptional()
  application_start_date?: string;

  @IsDateString()
  @IsOptional()
  application_end_date?: string;

  @IsDateString()
  @IsOptional()
  exam_date?: string;

  @IsDateString()
  @IsOptional()
  result_date?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  refrence_url?: string;

  @IsInt()
  @IsOptional()
  stream_id?: number;
}
