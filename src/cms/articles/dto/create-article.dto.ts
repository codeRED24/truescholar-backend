import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsString,
  IsNumber,
  Validate,
  IsEnum,
  IsArray,
  IsInt,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";
import { ApiProperty } from "@nestjs/swagger";
import { StatusType, ArticleType } from "../../../common/enums";
import { Transform } from "class-transformer";

export class CreateArticleCMSDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  sub_title?: string;

  @IsString()
  @Validate(SlugValidator)
  slug: string;

  @IsString()
  @IsEnum(ArticleType)
  type: ArticleType;

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

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  read_time?: number;


  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  is_active?: boolean;

  @IsString()
  @IsOptional()
  publication_date?: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({value}) => parseInt(value, 10))
  author_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
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
  @IsEnum(StatusType)
  status: StatusType;

  @IsOptional()
  @IsString()
  og_title?: string;

  @IsOptional()
  @IsString()
  og_description?: string;

  @IsOptional()
  @IsString()
  og_featured_img?: string;

  @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Transform(({ value }) => 
      Array.isArray(value) 
        ? value.map((v) => (isNaN(Number(v)) ? null : Number(v))).filter((v) => v !== null) 
        : isNaN(Number(value)) 
          ? [] 
          : [Number(value)]
    )
    course_group_id?: number[];
  
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Transform(({ value }) => 
      Array.isArray(value) 
        ? value.map((v) => (isNaN(Number(v)) ? null : Number(v))).filter((v) => v !== null) 
        : isNaN(Number(value)) 
          ? [] 
          : [Number(value)]
    )
    course_id?: number[];

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Transform(({ value }) => 
      Array.isArray(value) 
        ? value.map((v) => (isNaN(Number(v)) ? null : Number(v))).filter((v) => v !== null) 
        : isNaN(Number(value)) 
          ? [] 
          : [Number(value)]
    )
    college_id?: number[];

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Transform(({ value }) => 
      Array.isArray(value) 
        ? value.map((v) => (isNaN(Number(v)) ? null : Number(v))).filter((v) => v !== null) 
        : isNaN(Number(value)) 
          ? [] 
          : [Number(value)]
    )
    exam_id?: number[];


}
