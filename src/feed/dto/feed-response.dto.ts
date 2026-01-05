import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FeedAuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiPropertyOptional()
  user_type?: string;
}

export class FeedPostDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: [Object] })
  media: Array<{
    url: string;
    type: "image" | "video" | "document";
    thumbnailUrl?: string;
  }>;

  @ApiProperty()
  visibility: string;

  @ApiPropertyOptional()
  authorType?: string;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  taggedCollegeId?: number;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  commentCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: FeedAuthorDto })
  author: FeedAuthorDto;

  @ApiProperty()
  hasLiked: boolean;
}

export class FeedResponseDto {
  @ApiProperty({ type: [FeedPostDto] })
  posts: FeedPostDto[];

  @ApiPropertyOptional({
    description: "Cursor for next page, null if no more posts",
  })
  nextCursor: string | null;
}
