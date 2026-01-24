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

export class FeedCollegeDto {
  @ApiProperty()
  college_id: number;

  @ApiProperty()
  college_name: string;

  @ApiPropertyOptional()
  logo_img?: string;

  @ApiPropertyOptional()
  slug?: string;
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

  @ApiPropertyOptional({ type: FeedCollegeDto })
  taggedCollege?: FeedCollegeDto;

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

  @ApiProperty({
    description: "Whether the current user follows the post author",
  })
  isFollowing: boolean;
}

// Suggested user for "Who to follow" cards
export class FeedSuggestedUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  image?: string;

  @ApiProperty({ description: "Number of mutual connections" })
  mutualCount: number;
}

// Union type for heterogeneous feed items (posts, suggestions, ads, etc.)
export class FeedItemDto {
  @ApiProperty({
    enum: ["post", "suggestions"],
    description: "Type of feed item",
  })
  type: "post" | "suggestions";

  @ApiPropertyOptional({ type: FeedPostDto })
  post?: FeedPostDto;

  @ApiPropertyOptional({ type: [FeedSuggestedUserDto] })
  suggestions?: FeedSuggestedUserDto[];
}

export class FeedResponseDto {
  @ApiProperty({
    type: [FeedItemDto],
    description: "Heterogeneous feed items (posts, suggestions, etc.)",
  })
  items: FeedItemDto[];

  @ApiPropertyOptional({
    description: "Cursor for next page, null if no more items",
  })
  nextCursor: string | null;
}
