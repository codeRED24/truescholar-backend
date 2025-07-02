import { Transform } from "class-transformer";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import {
  QuestionPaperType,
  ShiftType,
  SubjectType,
} from "../../../../common/exam.enums";

export class CreateQuestionPaperDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsNotEmpty()
  exam_id: number;

  @IsString()
  @IsOptional()
  title?: string;



  
  @IsEnum(QuestionPaperType)
  @IsNotEmpty()
  type: QuestionPaperType;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @IsOptional()
  year?: number;

  @IsEnum(SubjectType)
  @IsOptional()
  subject?: SubjectType;

  @IsEnum(ShiftType)
  @IsOptional()
  shift?: ShiftType;
}
