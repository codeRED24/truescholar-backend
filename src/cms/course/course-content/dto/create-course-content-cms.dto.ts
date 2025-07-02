import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsBoolean, IsOptional, IsInt, IsUrl } from "class-validator";

export class CreateCourseContentCmsDto {
  
  @ApiProperty({ description: "Course ID", required: false })
  @IsOptional()
  @IsInt()
  course_id?: number;

  @ApiProperty({ description: "Silos", required: false, maxLength: 50 })
  @IsOptional()
  @IsString()
  silos?: string;

  @ApiProperty({ description: "Is the content active?", default: false })
  @IsBoolean()
  is_active: boolean = false;

  @ApiProperty({ description: "Title of the course content", maxLength: 300 })
  @IsString()
  title: string;

  @ApiProperty({ description: "Description", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Meta Description", required: false })
  @IsOptional()
  @IsString()
  meta_desc?: string;

  @ApiProperty({ description: "Author ID", required: false })
  @IsOptional()
  @IsInt()
  author_id?: number;

  @ApiProperty({ description: "Reference URL", required: false })
  @IsOptional()
  // @IsUrl()
  refrence_url?: string;

  @ApiProperty({ description: "Image URL", required: false })
  @IsOptional()
  // @IsUrl()
  img1_url?: string;

  @ApiProperty({ description: "SEO Parameters", required: false })
  @IsOptional()
  @IsString()
  seo_param?: string;

  @ApiProperty({ description: "OG Title", required: false })
  @IsOptional()
  @IsString()
  og_title?: string;

  @ApiProperty({ description: "OG Description", required: false })
  @IsOptional()
  @IsString()
  og_description?: string;

  @ApiProperty({ description: "OG Featured Image", required: false })
  @IsOptional()
  @IsString()
  og_featured_img?: string;

  


}
