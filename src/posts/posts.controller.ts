import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";
import { PostsService } from "./post.service";
import { CreatePostDto, UpdatePostDto, FeedQueryDto } from "./post.dto";
import { ConnectionsService } from "src/connections/connections.service";
import { LikesService } from "src/likes/likes.service";

@ApiTags("Posts")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly connectionsService: ConnectionsService,
    private readonly likesService: LikesService
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new post" })
  async createPost(@User() user: { id: string }, @Body() dto: CreatePostDto) {
    const post = await this.postsService.createPost(
      user.id,
      dto.content,
      dto.media,
      dto.visibility,
      dto.authorType,
      dto.type,
      dto.taggedCollegeId
    );
    return this.mapToResponse(post, false);
  }

  @Get("feed")
  @ApiOperation({ summary: "Get personalized feed" })
  async getFeed(@User() user: { id: string }, @Query() query: FeedQueryDto) {
    const connectionIds = await this.connectionsService.getConnectionUserIds(
      user.id
    );
    const posts = await this.postsService.getFeed(
      user.id,
      connectionIds,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
    const postIds = posts.map((p) => p.id);
    const likeStatuses = await this.likesService.getLikeStatusForPosts(
      user.id,
      postIds
    );
    return posts.map((post) =>
      this.mapToResponse(post, likeStatuses.get(post.id) || false)
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific post" })
  async getPost(@User() user: { id: string }, @Param("id") postId: string) {
    const post = await this.postsService.getPost(postId, user.id, (a, b) =>
      this.connectionsService.areConnected(a, b)
    );
    const hasLiked = await this.likesService.hasLikedPost(user.id, postId);
    return this.mapToResponse(post, hasLiked);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a post" })
  @UseGuards(ThrottlerGuard)
  @Throttle({ like: { limit: 30, ttl: 60000 } })
  async updatePost(
    @User() user: { id: string },
    @Param("id") postId: string,
    @Body() dto: UpdatePostDto
  ) {
    const post = await this.postsService.updatePost(
      postId,
      user.id,
      dto.content,
      dto.media,
      dto.visibility,
      dto.type,
      dto.taggedCollegeId
    );
    const hasLiked = await this.likesService.hasLikedPost(user.id, postId);
    return this.mapToResponse(post, hasLiked);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a post" })
  async deletePost(@User() user: { id: string }, @Param("id") postId: string) {
    await this.postsService.deletePost(postId, user.id);
    return { success: true };
  }

  @Post(":id/like")
  @ApiOperation({ summary: "Like a post" })
  @UseGuards(ThrottlerGuard)
  @Throttle({ like: { limit: 30, ttl: 60000 } })
  async likePost(@User() user: { id: string }, @Param("id") postId: string) {
    await this.likesService.likePost(user.id, postId);
    return { success: true };
  }

  @Delete(":id/like")
  @ApiOperation({ summary: "Unlike a post" })
  @UseGuards(ThrottlerGuard)
  @Throttle({ like: { limit: 30, ttl: 60000 } })
  async unlikePost(@User() user: { id: string }, @Param("id") postId: string) {
    await this.likesService.unlikePost(user.id, postId);
    return { success: true };
  }

  private mapToResponse(post: any, hasLiked: boolean) {
    return {
      id: post.id,
      content: post.content,
      media: post.media,
      visibility: post.visibility,
      authorType: post.authorType,
      type: post.type,
      taggedCollegeId: post.taggedCollegeId,
      taggedCollege: post.taggedCollege
        ? {
            college_id: post.taggedCollege.college_id,
            college_name: post.taggedCollege.college_name,
            logo_img: post.taggedCollege.logo_img,
          }
        : null,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author
        ? {
            id: post.author.id,
            name: post.author.name,
            image: post.author.image,
            user_type: post.author.user_type,
          }
        : { id: post.authorId, name: "", image: null, user_type: null },
      hasLiked,
    };
  }
}
