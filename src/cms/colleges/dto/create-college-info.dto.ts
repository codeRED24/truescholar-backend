import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  Length,
  Validate,
  IsInt,
  IsNumber,
} from "class-validator";
import { InstituteType } from "../../../common/enums";
import { SlugValidator } from "../../../common/Validators/slug-validator";

export class CreateCollegeInfoDto {
  @Transform(({ value }) =>
    value === "true" ? true : value === "false" ? false : value
  )
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

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

  @ApiProperty({ description: "Searchable names", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 700)
  search_names?: string;

  @ApiProperty({ description: "Parent college ID", required: false })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null ? parseInt(value, 10) : undefined
  )
  @IsInt({ message: "Parent college ID must be a valid integer" }) // Ensure it's an integer
  parent_college_id?: number;

  @ApiProperty({ description: "City ID", required: false })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  city_id: number;

  @ApiProperty({ description: "State ID", required: false })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  state_id: number;

  @ApiProperty({ description: "Country ID", required: false })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  country_id: number;

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
  @Transform(({ value }) =>
    value !== undefined && value !== null ? parseInt(value, 10) : undefined
  )
  @IsInt({ message: "Affiliated university ID must be a valid integer" }) // Ensure it's an integer
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

  @ApiProperty({ description: "Banner image URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 800)
  banner_img?: string;

  @ApiProperty({ description: "Total number of students", required: false })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null ? parseInt(value, 10) : undefined
  )
  @IsInt({ message: "Total Student must be a valid integer" }) // Ensure it's an integer
  total_student?: number;

  @ApiProperty({ description: "Campus size in acres", required: false })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null ? parseInt(value, 10) : undefined
  )
  @IsInt({ message: "Campus size in acres must be a valid integer" }) // Ensure it's an integer
  campus_size?: number;

  @ApiProperty({ description: "Is UGC approved", required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === "true" ? true : value === "false" ? false : value)
  UGC_approved?: boolean;

  @ApiProperty({ description: "Kapp rating", required: false })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null ? parseInt(value, 10) : undefined
  )
  @IsInt({ message: "Kapp rating must be a valid integer" }) // Ensure it's an integer
  kapp_rating?: number;

  @ApiProperty({ description: "Kapp score", required: false })
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null ? parseInt(value, 10) : undefined
  )
  @IsInt({ message: "Kapp score must be a valid integer" }) // Ensure it's an integer
  kapp_score?: number;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;

  @ApiProperty({ description: "Primary Stream", required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  primary_stream_id?: number;

  @ApiProperty({ description: "NAAC Grade", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 8)
  nacc_grade?: string;

  @ApiProperty({ description: "Slug for the college", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  @Validate(SlugValidator)
  slug?: string;

  @ApiProperty({ description: "girls_only", required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === "true" ? true : value === "false" ? false : value)
  girls_only?: boolean;

  @ApiProperty({
    description: "Is University",
    required: false,
    default: false,
  })
  @Transform(({ value }) =>
    value === "true" ? true : value === "false" ? false : value
  )
  @IsBoolean()
  @IsOptional()
  is_university?: boolean;

  @IsString()
  @IsOptional()
  meta_desc?: string;

  @ApiProperty({ description: "Is Online?", required: false })
  @Transform(({ value }) =>
    value === "true" ? true : value === "false" ? false : value
  )
  @IsBoolean()
  @IsOptional()
  is_online?: boolean;

  @ApiProperty({ description: "college brouchure", required: false })
  @IsOptional()
  @IsString()
  college_brochure?: string;
}
