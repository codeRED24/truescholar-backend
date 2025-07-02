import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Length,
} from "class-validator";

export class CreateCollegeExamDto {
  @ApiProperty({ description: "The ID of the college" })
  @IsNotEmpty()
  @IsNumber()
  college_id: number;

  @ApiProperty({ description: "The ID of the exam" })
  @IsNotEmpty()
  @IsNumber()
  exam_id: number;

  @ApiProperty({ description: "The ID of the college course" })
  @IsOptional()
  @IsNumber()
  college_course_id: number;

  @ApiProperty({ description: "The title of the college exam" })
  @IsNotEmpty()
  @IsString()
  @Length(0, 500)
  title: string;

  @ApiProperty({
    description: "The description of the college exam",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;

  @ApiProperty({ description: "Course Group ID", required: false })
  @IsOptional()
  @IsNumber()
  course_group_id?: number;
}
