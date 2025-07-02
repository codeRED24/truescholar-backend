import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Length,
} from "class-validator";
import { StatusType } from "../../../../common/enums";

export class CreateExamContentCMSDto {
  @ApiProperty({ description: "Exam Information", required: false })
  @IsOptional()
  @IsString()
  exam_info?: string;

  @ApiProperty({ description: "Exam Eligibility", required: false })
  @IsOptional()
  @IsString()
  exam_eligibility?: string;

  @ApiProperty({ description: "Exam Result", required: false })
  @IsOptional()
  @IsString()
  exam_result?: string;

  @ApiProperty({ description: "Important Highlights", required: false })
  @IsOptional()
  @IsString()
  exam_imp_highlight?: string;

  @ApiProperty({ description: "Application Process", required: false })
  @IsOptional()
  @IsString()
  application_process?: string;

  @ApiProperty({ description: "Syllabus", required: false })
  @IsOptional()
  @IsString()
  syllabus?: string;

  @ApiProperty({ description: "Exam Pattern", required: false })
  @IsOptional()
  @IsString()
  exam_pattern?: string;

  @ApiProperty({ description: "Cutoff", required: false })
  @IsOptional()
  @IsString()
  cutoff?: string;

  @ApiProperty({ description: "Fees Structure", required: false })
  @IsOptional()
  @IsString()
  fees_structure?: string;

  @ApiProperty({ description: "Application Mode", required: false })
  @IsOptional()
  @IsString()
  application_mode?: string;

  @ApiProperty({ description: "Eligibility Criteria", required: false })
  @IsOptional()
  @IsString()
  eligibility_criteria?: string;

  @ApiProperty({ description: "Result", required: false })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiProperty({ description: "Admit Card", required: false })
  @IsOptional()
  @IsString()
  admit_card?: string;

  @ApiProperty({ description: "topic title", required: false })
  @IsOptional()
  @IsString()
  topic_title?: string;

  @ApiProperty({ description: "approved by", required: false })
  @IsOptional()
  @IsString()
  approved_by?: string;

  @ApiProperty({ description: "description", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "description", required: false })
  @IsOptional()
  @IsString()
  silos?: string;

  @ApiProperty({ description: "Author ID", required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  author_id?: number;

  @ApiProperty({ description: "Is Active", required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  is_active?: boolean;

  @ApiProperty({ description: "Exam ID" })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  exam_id?: number;

  @ApiProperty({ description: "Exam ID" })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  year?: number;

  @IsString()
  @IsOptional()
  meta_desc?: string;

  @IsString()
  @IsOptional()
  img1_url?: string;

  @IsString()
  @IsOptional()
  img2_url?: string;

  @IsString()
  @IsOptional()
  assigned_to?: string;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;

  @ApiProperty({ description: "New Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url_new?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  stage_id?: number;

  @IsOptional()
  @IsString()
  seo_param: string;

  @ApiProperty({
    enum: StatusType,
    description: "Status of the college content",
  })
  status: StatusType;

  @IsOptional()
  @IsString()
  og_title?: string;

  @IsOptional()
  @IsString()
  og_description?: string;

  @IsOptional()
  @IsString()
  og_featured_img?: string;
}
