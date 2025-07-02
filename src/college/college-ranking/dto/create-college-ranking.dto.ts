import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Length,
} from "class-validator";

export class CreateCollegeRankingDto {
  @ApiProperty({ description: "UUID of the college" })
  @IsNumber()
  @IsNotEmpty()
  college_id?: number;

  @ApiProperty({ description: "UUID of the ranking agency" })
  @IsOptional()
  ranking_agency_id?: number;

  @ApiProperty({ description: "Name of the ranking agency" })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  agency?: string;

  @ApiProperty({ description: "Rank assigned by the agency" })
  @IsOptional()
  @IsNumber()
  rank?: number;

  @ApiProperty({ description: "Rank assigned by the agency" })
  @IsOptional()
  @IsString()
  max_rank?: string;

  @ApiProperty({ description: "ID of the course group" })
  @IsOptional()
  @IsNumber()
  course_group_id?: number;

  @ApiProperty({ description: "ID of the stream" })
  @IsNotEmpty()
  @IsNumber()
  stream_id?: number;

  @ApiProperty({ description: "Description of the ranking" })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ description: "Description of the ranking" })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  category?: string;

  @ApiProperty({ description: "Year of the ranking" })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ description: "Title of the rank" })
  @IsOptional()
  @IsString()
  @Length(0, 300)
  rank_title?: string;

  @ApiProperty({ description: "Subtitle of the rank" })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  rank_subtitle?: string;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 700)
  refrence_url?: string;
}
