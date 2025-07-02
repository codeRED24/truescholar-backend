import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

export class CreateCollegeScholarshipDto {
  @ApiProperty({
    description: "A custom identifier for the college scholarship",
  })
  @IsOptional()
  custom_id: string;

  @ApiProperty({
    description: "The college ID associated with the scholarship",
  })
  @IsNotEmpty()
  @IsNumber()
  college_id: number;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;
}
