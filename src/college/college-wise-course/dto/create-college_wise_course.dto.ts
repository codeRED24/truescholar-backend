import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Length,
} from "class-validator";

export class CreateCollegeWiseCourseDto {
  @ApiProperty({ description: "The name of the course" })
  @IsNotEmpty()
  @IsString()
  @Length(0, 400)
  name: string;

  @ApiProperty({ description: "Description of the course", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ description: "fees", required: false })
  @IsOptional()
  @IsNumber()
  fees?: number;

  @ApiProperty({ description: "Salary", required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ description: "Eligibility criteria", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  eligibility?: string;

  @ApiProperty({
    description: "Detailed eligibility description",
    required: false,
  })
  @IsOptional()
  @IsString()
  eligibility_description?: string;

  @ApiProperty({ description: "Is the course online?", required: false })
  @IsOptional()
  @IsBoolean()
  is_online?: boolean;

  @ApiProperty({ description: "Course level", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  level?: string;

  @ApiProperty({ description: "Course format", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  course_format?: string;

  @ApiProperty({ description: "Degree type", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  degree_type?: string;

  @ApiProperty({ description: "Is it an integrated course?", required: false })
  @IsOptional()
  @IsBoolean()
  is_integrated_course?: boolean;

  @ApiProperty({ description: "Duration type", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  duration_type?: string;

  @ApiProperty({ description: "Course duration", required: false })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({ description: "Course highlights", required: false })
  @IsOptional()
  @IsString()
  highlight?: string;

  @ApiProperty({ description: "Admission process", required: false })
  @IsOptional()
  @IsString()
  admission_process?: string;

  @ApiProperty({ description: "Overview of the course", required: false })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiProperty({ description: "Total seats available", required: false })
  @IsOptional()
  @IsNumber()
  total_seats?: number;

  @ApiProperty({ description: "Course syllabus", required: false })
  @IsOptional()
  @IsString()
  syllabus?: string;

  @ApiProperty({ description: "Course brochure URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  course_brochure?: string;

  @ApiProperty({ description: "KAPP score", required: false })
  @IsOptional()
  @IsNumber()
  kapp_score?: number;

  @ApiProperty({ description: "KAPP score", required: false })
  @IsOptional()
  @IsNumber()
  kapp_rating?: number;

  @ApiProperty({ description: "College ID", required: false })
  @IsOptional()
  @IsNumber()
  college_id: number;

  @ApiProperty({ description: "Course ID", required: false })
  @IsOptional()
  @IsNumber()
  course_id: number;

  @ApiProperty({ description: "course_group_id ID", required: true })
  @IsNotEmpty()
  @IsNumber()
  course_group_id?: number;

  @ApiProperty({
    description: "Is the course active?",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;

  @IsOptional()
  @IsNumber()
  stage_id?: number;
}




export class CollegeWiseCourseSection {
  name: string;
  salary: number;
  fees: number;
  kapp_rating: number;
  course_brochure: string;
  total_seats: number;
  duration: string;
  duration_type: string;
  is_integrated: boolean;
  degree_type: string;
  level: string;
  eligibility: string;
  course_id: number;
  course_group_id: number;
  course_group_name: string;
  college_id: number;
}

export class CollegeSection {
  college_id: number;
  college_name: string;
  college_slug: string;
  college_logo: string;
  college_type: string;
  college_brochure: string;
  is_online: boolean;
}

export class FilterSection {
  degree_type: string[];
  college_type: string[];
  course_group_name: string[];
}
