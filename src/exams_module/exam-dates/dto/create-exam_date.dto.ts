import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  Validate,
  IsNumber,
  Length,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";

export class CreateExamDateDto {
  @ApiProperty({ description: "The event title of the exam date" })
  @IsNotEmpty()
  event_Title: string;

  @ApiProperty({ description: "Slug for the exam date" })
  @IsString()
  @Validate(SlugValidator)
  slug?: string;

  @ApiProperty({ description: "Exam date" })
  @IsDateString()
  @IsOptional()
  exam_date?: string;

  @ApiProperty({ description: "Start date of the exam event" })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ description: "End date of the exam event" })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiProperty({ description: "Indicates if the date is tentative" })
  @IsBoolean()
  @IsOptional()
  tentative?: boolean;

  @ApiProperty({ description: "Exam year" })
  @IsString()
  @IsOptional()
  year?: number;

  @ApiProperty({ description: "Exam id" })
  @IsOptional()
  @IsNumber()
  exam_id?: number;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;

  @ApiProperty({
    description: "Indicates if the exam date is active",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
