import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
  Length,
  IsDecimal,
} from "class-validator";
import { InstituteType } from "../../../common/enums";
export class CreateCollegeInfoDto {
  @ApiProperty({ description: "The name of the college" })
  @IsNotEmpty()
  @IsString()
  @Length(0, 700)
  college_name: string;

  @ApiProperty({ description: "Short name for the college", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  short_name?: string;

  @IsString()
  @IsOptional()
  meta_desc?: string;

  @ApiProperty({ description: "Slug for the college", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  slug?: string;

  @ApiProperty({ description: "Searchable names", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 700)
  search_names?: string;

  @ApiProperty({ description: "Parent college ID", required: false })
  @IsOptional()
  @IsNumber()
  parent_college_id?: number;

  @ApiProperty({ description: "City ID", required: false })
  @IsNotEmpty()
  @IsNumber()
  city_id?: number;

  @ApiProperty({ description: "State ID", required: false })
  @IsNotEmpty()
  @IsNumber()
  state_id?: number;

  @ApiProperty({ description: "Country ID", required: false })
  @IsNotEmpty()
  @IsNumber()
  country_id?: number;

  @ApiProperty({ description: "Location details", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  location?: string;

  @ApiProperty({ description: "PIN Code", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 6)
  PIN_code?: string;

  @ApiProperty({ description: "Latitude and Longitude", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  latitude_longitude?: string;

  @ApiProperty({ description: "College email", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  college_email?: string;

  @ApiProperty({ description: "College phone number", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  college_phone?: string;

  @ApiProperty({ description: "College website", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  college_website?: string;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;

  @ApiProperty({
    description: "Type of institute",
    enum: InstituteType,
    required: false,
  })
  @IsOptional()
  @IsEnum(InstituteType)
  type_of_institute?: InstituteType;

  @ApiProperty({ description: "Affiliated university ID", required: false })
  @IsOptional()
  @IsNumber()
  affiliated_university_id?: number;

  @ApiProperty({ description: "Year founded", required: false })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  founded_year?: string;

  @ApiProperty({ description: "Logo image URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 800)
  logo_img?: string;

  @ApiProperty({ description: "NAAC Grade", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 8)
  nacc_grade?: string;

  @ApiProperty({ description: "Banner image URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 800)
  banner_img?: string;


  @ApiProperty({ description: "college brouchure", required: false })
  @IsOptional()
  @IsString()
  college_brochure?: string;

  @ApiProperty({ description: "Total number of students", required: false })
  @IsOptional()
  @IsNumber()
  total_student?: number;

  @ApiProperty({ description: "Primary Stream", required: false })
  @IsOptional()
  @IsNumber()
  primary_stream_id?: number;

  @ApiProperty({ description: "Campus size in acres", required: false })
  @IsOptional()
  @IsNumber()
  campus_size?: number;

  @ApiProperty({ description: "Is UGC approved", required: false })
  @IsOptional()
  @IsBoolean()
  UGC_approved?: boolean;

  @ApiProperty({ description: "girls_only", required: false })
  @IsOptional()
  @IsBoolean()
  girls_only?: boolean;

  @ApiProperty({
    description: "Is University",
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_university?: boolean;

  @ApiProperty({ description: "Is Active?", required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: "Is Active?", required: false })
  @IsOptional()
  @IsBoolean()
  is_online?: boolean;

  @ApiProperty({ description: "Kapp score", required: false })
  @IsOptional()
  @IsNumber()
  kapp_score?: number;

  @ApiProperty({ description: "Kapp rating", required: false })
  @IsOptional()
  @IsNumber()
  kapp_rating?: number;

  @ApiProperty({ description: "Area", required: false })
  @IsOptional()
  @IsString()
  area?: string;
}
