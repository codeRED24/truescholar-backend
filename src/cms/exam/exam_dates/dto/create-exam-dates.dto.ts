import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from "class-validator";
import { ExamDateEvents } from "../../../../common/exam.enums";

export class CreateExamDateDto {
  @IsInt()
  exam_id: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsDateString()
  start_date: string; // Expected format: YYYY-MM-DD

  @IsOptional()
  @IsDateString()
  end_date: string; // Expected format: YYYY-MM-DD

  
  @IsEnum(ExamDateEvents)
  @IsNotEmpty()
  event_type: ExamDateEvents;

  @IsOptional()
  @IsBoolean()
  is_tentative: boolean;

  @IsInt()
  @Min(2023) // Minimum year allowed
  @Max(2035) // Maximum year allowed
  @IsNotEmpty()
  year: number;
}
