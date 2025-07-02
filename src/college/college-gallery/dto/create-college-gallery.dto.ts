import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsNumber,
  Length,
} from "class-validator";

export class CreateCollegeGalleryDto {
  @ApiProperty({ description: "URL of the media", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  media_URL?: string;

  @ApiProperty({
    description: "Tag associated with the gallery",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  tag?: string;

  @ApiProperty({ description: "Alt text for the media", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  alt_text?: string;

  @ApiProperty({
    description: "Indicates if the gallery is active",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active: boolean = true;

  @ApiProperty({
    description: "College ID associated with the Gallery",
    required: false,
  })
  @IsNotEmpty()
  @IsNumber()
  college_id?: number;

  @ApiProperty({ description: "Refrence URL", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  refrence_url?: string;
}
