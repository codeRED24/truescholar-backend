import { ApiProperty } from "@nestjs/swagger";

export class ExamNewsItemDto {
  @ApiProperty()
  news_id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;
}

export class ExamSitemapDto {
  @ApiProperty()
  exam_id: number;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  available_silos: string[];

  @ApiProperty({ type: [ExamNewsItemDto] })
  news_articles: ExamNewsItemDto[];
}

export class ExamSitemapResponseDto {
  @ApiProperty({ type: [ExamSitemapDto] })
  exams: ExamSitemapDto[];

  @ApiProperty()
  total: number;
}
