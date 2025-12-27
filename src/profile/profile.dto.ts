import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";

// Experience entry DTO
export class ExperienceEntryDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  company: string;

  @IsString()
  role: string;

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string | null;

  @IsBoolean()
  isCurrent: boolean;

  @IsOptional()
  @IsString()
  description?: string | null;
}

// Education entry DTO
export class EducationEntryDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsNumber()
  collegeId?: number | null;

  @IsOptional()
  @IsString()
  collegeName?: string | null;

  @IsOptional()
  @IsNumber()
  courseId?: number | null;

  @IsOptional()
  @IsString()
  courseName?: string | null;

  @IsOptional()
  @IsString()
  fieldOfStudy?: string | null;

  @IsOptional()
  @IsNumber()
  startYear?: number | null;

  @IsOptional()
  @IsNumber()
  endYear?: number | null;

  @IsOptional()
  @IsString()
  grade?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;
}

// Update Profile DTO
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  bio?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceEntryDto)
  experience?: ExperienceEntryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationEntryDto)
  education?: EducationEntryDto[];

  @IsOptional()
  @IsString()
  linkedin_url?: string | null;

  @IsOptional()
  @IsString()
  twitter_url?: string | null;

  @IsOptional()
  @IsString()
  github_url?: string | null;

  @IsOptional()
  @IsString()
  website_url?: string | null;

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsString()
  state?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
