import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Validate,
  IsDateString,
  Length,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";

export class CreateExamDto {
  @ApiProperty({ description: "Custom identifier for the exam" })
  @IsNotEmpty()
  custom_id: string;

  @ApiProperty({ description: "Name of the exam" })
  @IsNotEmpty()
  exam_name: string;

  @ApiProperty({ description: "Slug for the exam" })
  @IsString()
  @Validate(SlugValidator)
  slug?: string;

  @ApiProperty({ description: "Last edited by" })
  @IsOptional()
  @IsString()
  last_edited_by?: string;

  @ApiProperty({ description: "Is Active?" })
  @IsOptional()
  @IsBoolean()
  is_active?: string;

  @ApiProperty({ description: "Duration of the exam in minutes" })
  @IsOptional()
  @IsNumber()
  exam_duration?: number;

  @ApiProperty({ description: "Subject of the exam" })
  @IsOptional()
  @IsString()
  exam_subject?: string;

  @ApiProperty({ description: "Description of the exam" })
  @IsOptional()
  @IsString()
  exam_description?: string;

  @ApiProperty({ description: "Mode of the exam" })
  @IsOptional()
  @IsString()
  mode_of_exam?: string;

  @ApiProperty({ description: "Level of the exam" })
  @IsOptional()
  @IsString()
  level_of_exam?: string;

  @ApiProperty({ description: "Level of the exam" })
  @IsOptional()
  @IsString()
  exam_logo?: string;

  @ApiProperty({ description: "no_of_application" })
  @IsOptional()
  @IsNumber()
  no_of_application?: number;

  @ApiProperty({ description: "Kapscore 1" })
  @IsOptional()
  @IsNumber()
  kapp_score?: number;

  @ApiProperty({ description: "Meta description for SEO" })
  @IsOptional()
  @IsString()
  meta_desc?: string;

  @ApiProperty({ description: "Additional information" })
  @IsOptional()
  @IsString()
  exam_info?: string;

  @ApiProperty({ description: "Application process details" })
  @IsOptional()
  @IsString()
  Application_process?: string;

  @ApiProperty({ description: "official_website" })
  @IsOptional()
  @IsString()
  official_website?: string;

  @ApiProperty({ description: "official_website" })
  @IsOptional()
  @IsString()
  official_email?: string;

  @ApiProperty({ description: "official_website" })
  @IsOptional()
  @IsString()
  official_mobile?: string;

  @ApiProperty({ description: "Minimum exam fee" })
  @IsOptional()
  @IsString()
  exam_fee_min?: string;

  @ApiProperty({ description: "Maximum exam fee" })
  @IsOptional()
  @IsString()
  exam_fee_max?: string;

  @ApiProperty({ description: "Exam short name" })
  @IsOptional()
  @IsString()
  exam_shortname?: string;

  @ApiProperty({ description: "Application link" })
  @IsOptional()
  @IsString()
  application_link?: string;

  @ApiProperty({ description: "Last update date" })
  @IsOptional()
  @IsDateString()
  last_update?: string;

  @ApiProperty({ description: "Eligibility criteria description" })
  @IsOptional()
  @IsString()
  eligibilty_description?: string;

  @ApiProperty({ description: "Exam method" })
  @IsOptional()
  @IsString()
  exam_method?: string;

  @ApiProperty({ description: "Authority conducting the exam" })
  @IsOptional()
  @IsString()
  conducting_authority?: string;

  @ApiProperty({ description: "Application mode" })
  @IsOptional()
  @IsString()
  application_mode?: string;

  @ApiProperty({ description: "Is the exam published?" })
  @IsOptional()
  @IsBoolean()
  IsPublished?: boolean;

  @ApiProperty({ description: "Key article UUID" })
  @IsOptional()
  @IsNumber()
  key_article?: number;

  // @ApiProperty({ description: "Refrence URL", required: false })
  // @IsOptional()
  // @IsString()
  // @Length(0, 500)
  // refrence_url?: string;

  @ApiProperty({ description: "Stream", required: false })
  @IsOptional()
  Stream?: string[];

  @ApiProperty({
    description: "Array of exam center city",
    required: false,
  })
  @IsOptional()
  exam_center_city?: string[];

  @ApiProperty({ description: "Array of tag", required: false })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: "Application start date" })
  @IsOptional()
  @IsDateString()
  application_start_date?: string;

  @ApiProperty({ description: "Application end date" })
  @IsOptional()
  @IsDateString()
  application_end_date?: string;

  @ApiProperty({ description: "Exam date" })
  @IsOptional()
  @IsDateString()
  exam_date?: string;

  @ApiProperty({ description: "Result date" })
  @IsOptional()
  @IsDateString()
  result_date?: string;
}
