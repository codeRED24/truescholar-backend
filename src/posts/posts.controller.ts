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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { FileInterceptor, File } from "@nest-lab/fastify-multer";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";
import { PostsService } from "./post.service";
import { CreatePostDto, UpdatePostDto, FeedQueryDto } from "./post.dto";
import { FollowersService } from "src/followers/followers.service";
import { LikesService } from "src/likes/likes.service";
import { CollegeMemberService } from "src/college-member/college-member.service";
import { AuthorType } from "src/common/enums";

// DTO for like action with optional author context
class LikeActionDto {
  authorType?: AuthorType;
  collegeId?: number;
}

@ApiTags("Posts")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly followersService: FollowersService,
    private readonly likesService: LikesService,
    private readonly collegeMemberService: CollegeMemberService
  ) {}

  @Post("media")
  @ApiOperation({ summary: "Upload media for a post" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async uploadMedia(
    @User() user: { id: string },
    @UploadedFile() file: File
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    // Validate file type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Allowed: Images, Videos (MP4, MOV, WebM), and Documents (PDF, DOC)"
      );
    }

    // Validate file size (10MB for images/docs, 100MB for videos)
    const maxSize = file.mimetype.startsWith("video/")
      ? 100 * 1024 * 1024
      : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large. Max size: ${file.mimetype.startsWith("video/") ? "100MB" : "10MB"}`
      );
    }

    const result = await this.postsService.uploadMedia(file, user.id);
    return result;
  }

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

  @Get(":id")
  @ApiOperation({ summary: "Get a specific post" })
  async getPost(
    @User() user: { id: string },
    @Param("id") postId: string,
    @Query() query: FeedQueryDto
  ) {
    const post = await this.postsService.getPost(
      postId,
      user.id,
      async (a, b) => {
        // Check if user a follows user b
        const following = await this.followersService.getFollowingIds(a);
        return following.includes(b);
      }
    );
    const hasLiked = await this.likesService.hasLikedPost(
      user.id,
      postId,
      query.authorType,
      query.collegeId
    );
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
    // Since this is an update by the author, checking like status as USER is the sensible default,
    // or we could ask the frontend to pass context. For now default to USER is safe.
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
  async likePost(
    @User() user: { id: string },
    @Param("id") postId: string,
    @Body() dto: LikeActionDto
  ) {
    // Validate college admin status if acting as college
    if (dto.authorType === AuthorType.COLLEGE && dto.collegeId) {
      const isAdmin = await this.collegeMemberService.isCollegeAdmin(
        user.id,
        dto.collegeId
      );
      if (!isAdmin) {
        throw new ForbiddenException(
          "You are not authorized to act on behalf of this college"
        );
      }
    }

    await this.likesService.likePost(
      user.id,
      postId,
      dto.authorType,
      dto.collegeId
    );
    return { success: true };
  }

  @Delete(":id/like")
  @ApiOperation({ summary: "Unlike a post" })
  @UseGuards(ThrottlerGuard)
  @Throttle({ like: { limit: 30, ttl: 60000 } })
  async unlikePost(
    @User() user: { id: string },
    @Param("id") postId: string,
    @Body() dto: LikeActionDto
  ) {
    // Validate college admin status if acting as college
    if (dto.authorType === AuthorType.COLLEGE && dto.collegeId) {
      const isAdmin = await this.collegeMemberService.isCollegeAdmin(
        user.id,
        dto.collegeId
      );
      if (!isAdmin) {
        throw new ForbiddenException(
          "You are not authorized to act on behalf of this college"
        );
      }
    }

    await this.likesService.unlikePost(
      user.id,
      postId,
      dto.authorType,
      dto.collegeId
    );
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
            slug: post.taggedCollege.slug,
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
