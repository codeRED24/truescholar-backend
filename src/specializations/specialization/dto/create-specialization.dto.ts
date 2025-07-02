import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Validate,
} from "class-validator";
import { SlugValidator } from "../../../common/Validators/slug-validator";

export class CreateSpecializationDto {
  @ApiProperty({ description: "The name of the specialization" })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Full name of the specialization",
    required: false,
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({ description: "Slug for the course" })
  @IsString()
  @Validate(SlugValidator)
  slug: string;

  @ApiProperty({
    description: "Indicates if the specialization is active",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: "Kapp score for the specialization",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  kapp_score?: number;
}
