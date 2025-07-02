import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { IsNull } from "typeorm";

export class CreateCollegeHostelCampusDto {
  @ApiProperty({
    description: "College ID associated with the hostel and campus",
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  college_id?: number;

  @ApiProperty({
    description: "Description of the hostel and campus",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;
}
