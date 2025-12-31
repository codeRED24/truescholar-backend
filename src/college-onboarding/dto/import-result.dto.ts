import { ApiProperty } from "@nestjs/swagger";

export class ImportResultDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  imported: number;

  @ApiProperty()
  failed: number;

  @ApiProperty({ type: [Object] })
  errors: { row: number; error: string }[];
}
