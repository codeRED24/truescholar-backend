import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CreateReelDto {
  // `reel` is expected as a multipart file (UploadedFiles) and not sent as a JSON string.
  // We therefore omit strict string validation here and treat the file via @UploadedFiles() in the controller.

  @ApiProperty({ description: "User id", required: true, example: 1 })
  @Type(() => Number)
  @IsInt()
  user_id: number;

  @ApiProperty({ description: "College id", required: true, example: 1 })
  @Type(() => Number)
  @IsInt()
  college_id: number;

  @ApiProperty({ description: "Type", required: false, example: "video" })
  @IsOptional()
  @IsString()
  type?: string;
}
