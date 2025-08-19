import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsArray,
  ArrayNotEmpty,
  IsIn,
  IsNumber,
  Min,
  Max,
} from "class-validator";

export class CreateReviewDto {
  @ApiPropertyOptional({ description: "User id who submits the review" })
  @IsInt()
  user_id: number;

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

  // comments
  @ApiPropertyOptional({ description: "Campus experience comment" })
  @IsOptional()
  @IsString()
  campus_experience_comment?: string;

  @ApiPropertyOptional({ description: "Placement journey comment" })
  @IsOptional()
  @IsString()
  placement_journey_comment?: string;

  @ApiPropertyOptional({ description: "Academic experience comment" })
  @IsOptional()
  @IsString()
  academic_experience_comment?: string;

  @ApiPropertyOptional({ description: "College admission comment" })
  @IsOptional()
  @IsString()
  college_admission_comment?: string;

  // ratings 1-5
  @ApiPropertyOptional({ description: "Campus experience rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  campus_experience_rating?: number;

  @ApiPropertyOptional({ description: "Placement journey rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  placement_journey_rating?: number;

  @ApiPropertyOptional({ description: "Academic experience rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  academic_experience_rating?: number;

  @ApiPropertyOptional({ description: "College admission rating (1-5)" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  college_admission_rating?: number;

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
}
