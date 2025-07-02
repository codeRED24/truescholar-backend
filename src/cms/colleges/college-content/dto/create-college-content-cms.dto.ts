import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Length,
} from "class-validator";
export class CollegeContentDto {
  silos: string;
  title: string;
  description: string;
  updated_at: Date;
  is_active: boolean;
  author_name: string;
}

export class CreateCollegeContentCMSDto {
  @ApiProperty({ description: "Title of the college content" })
  @IsNotEmpty()
  @IsString()
  @Length(0, 300)
  title: string;

  @ApiProperty({
    description: "Description of the college content",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Assigned_To",
    required: false,
  })
  @IsOptional()
  @IsString()
  assigned_to?: string;

  @ApiProperty({
    description: "College ID associated with the content",
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  college_id: number;

  @ApiProperty({
    description: "Silos associated with the content",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  silos?: string;

  @ApiProperty({
    description: "Author ID associated with the content",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  author_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  stage_id?: number;

  @ApiProperty({
    description: "Indicates if the content is active",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  is_active?: boolean;

  @ApiProperty({
    description: "Indicates if the content is active",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  girls_only?: boolean;

  @ApiProperty({
    description: "SEO parameters for the content",
    required: false,
  })
  @IsOptional()
  @IsString()
  seo_param?: string;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;

  @ApiProperty({ description: "New Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url_new?: string;

  @IsString()
  @IsOptional()
  meta_desc?: string;

  @IsString()
  @IsOptional()
  approved_by?: string;

  @IsString()
  @IsOptional()
  img1_url?: string;

  @IsString()
  @IsOptional()
  img2_url?: string;

  @ApiProperty({
    description: "Status of the college content",
  })
  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  og_title?: string;

  @IsOptional()
  @IsString()
  og_description?: string;

  @IsOptional()
  @IsString()
  og_featured_img?: string;
}
