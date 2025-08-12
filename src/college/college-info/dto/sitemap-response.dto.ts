import { ApiProperty } from "@nestjs/swagger";

export class CollegeSitemapDto {
  @ApiProperty()
  college_id: number;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  available_tabs: string[];
}

export class CollegeSitemapResponseDto {
  @ApiProperty({ type: [CollegeSitemapDto] })
  colleges: CollegeSitemapDto[];

  @ApiProperty()
  total: number;
}
