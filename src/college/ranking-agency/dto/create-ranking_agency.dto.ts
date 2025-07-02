import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsEmail,
  IsUUID,
} from "class-validator";

export class CreateRankingAgencyDto {
  @ApiProperty({ description: "Name of the ranking agency" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "Short name of the ranking agency",
    required: false,
  })
  @IsOptional()
  @IsString()
  short_name?: string;

  @ApiProperty({
    description: "Description of the ranking agency",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Logo URL of the ranking agency",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({
    description: "Website URL of the ranking agency",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: "Contact email of the ranking agency",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  contact_email?: string;
}
