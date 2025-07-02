import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateExamFAQDto {
  @ApiProperty({ description: 'Exam ID to which this FAQ belongs' })
  @IsNotEmpty()
  @IsNumber()
  exam_id: number;

  @ApiProperty({ description: 'The FAQ question' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ description: 'The answer to the FAQ' })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty({
    description: 'Additional description for the FAQ',
    required: false,
  })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Whether this FAQ is active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
