import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsNumber,
} from "class-validator";

export class CreateCollegeWisePlacementDto {
  @ApiProperty({
    description: "College ID associated with the content",
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  college_id?: number;

  @ApiProperty({ description: "Year of the placement", required: false })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ description: "Highest package offered", required: false })
  @IsOptional()
  @IsNumber()
  highest_package?: number;

  @ApiProperty({ description: "Average package offered", required: false })
  @IsOptional()
  @IsNumber()
  avg_package?: number;

  @ApiProperty({ description: "Median package offered", required: false })
  @IsOptional()
  @IsNumber()
  median_package?: number;

  @ApiProperty({ description: "Top recruiters", required: false })
  @IsOptional()
  @IsString()
  top_recruiters?: string;

  @ApiProperty({ description: "Particulars", required: false })
  @IsOptional()
  @IsString()
  particulars?: string;

  @ApiProperty({ description: "Particulars", required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: "Particulars", required: false })
  @IsOptional()
  @IsNumber()
  title_value?: number;

  @ApiProperty({ description: "Placement percentage", required: false })
  @IsOptional()
  @IsNumber()
  placement_percentage?: number;

  @ApiProperty({ description: "Description of the placement", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Category", required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;
}
