import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  Matches,
} from "class-validator";

export class CreateLeadFormDto {
  @ApiProperty({ description: "Lead Name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  mobile_no: string;

  @ApiProperty({ description: "Course ID the lead is interested in" })
  @IsOptional()
  @IsNumber()
  course_group_id: number;

  @ApiProperty({ description: "Preferred colleges" })
  @IsOptional()
  @IsNumber()
  college_id: number;

  @ApiProperty({ description: "Preferred city" })
  @IsNumber()
  @IsOptional()
  city_id: number;

  @ApiProperty({ description: "Response URL", required: false })
  @IsOptional()
  @IsString()
  response_url?: string;

  @ApiProperty({ description: "Location of the lead", required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: "Is the lead unsure about their choices",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  not_sure?: boolean;

  @ApiProperty({
    description: "Is Active?",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: "Preferred city of the lead" })
  @IsOptional()
  @IsNumber()
  preferred_city: number;
}
