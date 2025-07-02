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

export class CreateCollegeVideoDto {
  @ApiProperty({ description: "URL of the media file", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  media_URL?: string;

  @ApiProperty({ description: "Tag for the college video", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  tag?: string;

  @ApiProperty({ description: "Alt text for the video", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  alt_text?: string;

  @ApiProperty({ description: "URL of the thumbnail", required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  thumbnail_URL?: string;

  @ApiProperty({
    description: "Boolean indicating active status",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active: boolean = true;

  @ApiProperty({
    description: "College ID associated with the Videos",
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
