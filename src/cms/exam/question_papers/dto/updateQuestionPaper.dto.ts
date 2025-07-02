import { Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import {
  QuestionPaperType,
  ShiftType,
  SubjectType,
} from "../../../../common/exam.enums";

export class UpdateQuestionPaperDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  exam_id?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(QuestionPaperType)
  type?: QuestionPaperType;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsEnum(SubjectType)
  subject?: SubjectType;

  @IsOptional()
  @IsEnum(ShiftType)
  shift?: ShiftType;
}
