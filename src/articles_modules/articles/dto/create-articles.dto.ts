import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  Validate,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";
import { ApiProperty } from "@nestjs/swagger";
import { StatusType } from "../../../common/enums";
export class CreateArticleDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  sub_title: string;

  @IsString()
  @Validate(SlugValidator)
  slug?: string;

  @IsString()
  @ApiProperty({
    description: "Description of the Article",
    required: false,
  })
  @IsOptional()
  content?: string;

  @IsOptional()
  @IsString()
  meta_desc?: string;

  @IsOptional()
  @IsString()
  img1_url?: string;

  @IsOptional()
  @IsString()
  img2_url?: string;

  @IsString()
  @IsOptional()
  read_time?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  publication_date?: string;

  @IsNumber()
  @IsNotEmpty()
  author_id?: number;

  @IsOptional()
  @IsNumber()
  stage_id: number;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  approved_by?: string;

  @IsString()
  @IsOptional()
  assigned_to?: string;

  @ApiProperty({
    enum: StatusType,
    description: "Status of the college content",
  })
  status: StatusType;

}
