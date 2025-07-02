import { IsNotEmpty, IsOptional, IsString, IsNumber, IsUrl } from "class-validator";

export class CreateExamDocumentDto {
  @IsOptional()
  created_at?: string;

  @IsOptional()
  updated_at?: string;

  @IsString()
  @IsOptional()
  exam_result_url: string;

  @IsString()
  @IsOptional()
  exam_answer_key_url?: string;

  @IsString()
  @IsOptional()
  exam_paper_url?: string;

  @IsString()
  @IsOptional()
  doc_type?: string;

  @IsOptional()
  @IsNumber()
  exam_year?: number;

  @IsNumber()
  @IsNotEmpty()
  exam_id: number;
}
