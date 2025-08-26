import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  IsIn,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from "class-validator";

export class CreateReviewDto {
  @ApiProperty({ description: "User id who submits the review" })
  @IsInt()
  user_id: number;

  @ApiProperty({ description: "College id (int)", required: false })
  @IsOptional()
  @IsNumber()
  college_id?: number;

  @ApiProperty({ description: "Course id (int)", required: false })
  @IsOptional()
  @IsNumber()
  course_id?: number;

  @ApiProperty({ description: "College location", required: false })
  @IsOptional()
  @IsString()
  college_location?: string;

  @ApiProperty({ description: "Passing year", required: false })
  @IsOptional()
  @IsNumber()
  pass_year?: number;

  @ApiPropertyOptional({ description: "Profile picture url" })
  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  @ApiPropertyOptional({ description: "Linkedin profile url" })
  @IsOptional()
  @IsString()
  linkedin_profile?: string;

  @ApiPropertyOptional({ description: "Student id url" })
  @IsOptional()
  @IsString()
  student_id_url?: string;

  @ApiPropertyOptional({ description: "Mark sheet url" })
  @IsOptional()
  @IsString()
  mark_sheet_url?: string;

  @ApiPropertyOptional({ description: "Degree certificate url" })
  @IsOptional()
  @IsString()
  degree_certificate_url?: string;

  @ApiPropertyOptional({ description: "Review title" })
  @IsOptional()
  @IsString()
  review_title?: string;

  // college images
  @ApiPropertyOptional({
    description: "Array of college image urls",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  college_images_urls?: string[];

  @ApiPropertyOptional({
    description: "Status of the review",
    enum: ["pending", "approved", "rejected"],
  })
  @IsOptional()
  @IsIn(["pending", "approved", "rejected"])
  status?: "pending" | "approved" | "rejected";

  @ApiPropertyOptional({
    description: "Reward status",
    enum: ["pending", "processed", "paid"],
  })
  @IsOptional()
  @IsIn(["pending", "processed", "paid"])
  reward_status?: "pending" | "processed" | "paid";

  // Financial Information
  @ApiPropertyOptional({ description: "Annual tuition fees" })
  @IsOptional()
  @IsNumber()
  annual_tuition_fees?: number;

  @ApiPropertyOptional({ description: "Hostel fees" })
  @IsOptional()
  @IsNumber()
  hostel_fees?: number;

  @ApiPropertyOptional({ description: "Other college charges" })
  @IsOptional()
  @IsNumber()
  other_charges?: number;

  @ApiPropertyOptional({ description: "Whether scholarship was availed" })
  @IsOptional()
  @IsBoolean()
  scholarship_availed?: boolean;

  @ApiPropertyOptional({ description: "Scholarship name" })
  @IsOptional()
  @IsString()
  scholarship_name?: string;

  @ApiPropertyOptional({ description: "Scholarship amount" })
  @IsOptional()
  @IsNumber()
  scholarship_amount?: number;

  // Detailed Feedback Fields
  @ApiPropertyOptional({ description: "Overall satisfaction rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  overall_satisfaction_rating?: number;

  @ApiPropertyOptional({ description: "Overall experience feedback" })
  @IsOptional()
  @IsString()
  overall_experience_feedback?: string;

  @ApiPropertyOptional({ description: "Teaching quality rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  teaching_quality_rating?: number;

  @ApiPropertyOptional({ description: "Teaching quality feedback" })
  @IsOptional()
  @IsString()
  teaching_quality_feedback?: string;

  @ApiPropertyOptional({ description: "Infrastructure rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  infrastructure_rating?: number;

  @ApiPropertyOptional({ description: "Infrastructure feedback" })
  @IsOptional()
  @IsString()
  infrastructure_feedback?: string;

  @ApiPropertyOptional({ description: "Library rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  library_rating?: number;

  @ApiPropertyOptional({ description: "Library feedback" })
  @IsOptional()
  @IsString()
  library_feedback?: string;

  @ApiPropertyOptional({ description: "Placement support rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  placement_support_rating?: number;

  @ApiPropertyOptional({ description: "Placement support feedback" })
  @IsOptional()
  @IsString()
  placement_support_feedback?: string;

  @ApiPropertyOptional({ description: "Administrative support rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  administrative_support_rating?: number;

  @ApiPropertyOptional({ description: "Administrative support feedback" })
  @IsOptional()
  @IsString()
  administrative_support_feedback?: string;

  @ApiPropertyOptional({ description: "Hostel rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  hostel_rating?: number;

  @ApiPropertyOptional({ description: "Hostel feedback" })
  @IsOptional()
  @IsString()
  hostel_feedback?: string;

  @ApiPropertyOptional({ description: "Extracurricular rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  extracurricular_rating?: number;

  @ApiPropertyOptional({ description: "Extracurricular feedback" })
  @IsOptional()
  @IsString()
  extracurricular_feedback?: string;

  @ApiPropertyOptional({ description: "Improvement suggestions" })
  @IsOptional()
  @IsString()
  improvement_suggestions?: string;
}
