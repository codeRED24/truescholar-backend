import { Controller, Get, Query, UseGuards, Optional } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";
import { FeedService } from "./feed.service";
import { FeedQueryDto, FeedResponseDto } from "./dto";

@ApiTags("Feed")
@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * Get personalized feed for authenticated users
   * Returns blended feed: connections + trending + promoted
   */
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get personalized feed",
    description:
      "Returns a blended feed with 70% connection posts, 25% trending/discovery, and 5% promoted content (future).",
  })
  @ApiResponse({ status: 200, type: FeedResponseDto })
  async getFeed(
    @User() user: { id: string },
    @Query() query: FeedQueryDto
  ): Promise<FeedResponseDto> {
    return this.feedService.getFeed(user.id, query.cursor, query.limit || 20);
  }

  /**
   * Get guest feed for unauthenticated users
   * Returns trending content only
   */
  @Get("guest")
  @ApiOperation({
    summary: "Get guest feed (unauthenticated)",
    description:
      "Returns trending content for users who are not logged in. Fully cacheable.",
  })
  @ApiResponse({ status: 200, type: FeedResponseDto })
  async getGuestFeed(@Query() query: FeedQueryDto): Promise<FeedResponseDto> {
    return this.feedService.getGuestFeed(query.cursor, query.limit || 20);
  }

  /**
   * Warm cache for authenticated user (call on login)
   */
  @Get("warm")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Warm feed cache",
    description: "Pre-populate feed cache for faster subsequent loads.",
  })
  async warmCache(@User() user: { id: string }): Promise<{ success: boolean }> {
    await this.feedService.warmCache(user.id);
    return { success: true };
  }
}
