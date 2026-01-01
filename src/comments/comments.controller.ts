import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";
import { CommentsService } from "./comments.service";
import { CommentsQueryDto, CreateCommentDto } from "./comment.dto";
import { LikesService } from "src/likes/likes.service";

@ApiTags("Comments")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("posts/:postId/comments")
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly likesService: LikesService
  ) {}

  @Post()
  @ApiOperation({ summary: "Add a comment to a post" })
  async addComment(
    @User() user: { id: string },
    @Param("postId") postId: string,
    @Body() dto: CreateCommentDto
  ) {
    const comment = await this.commentsService.addComment(
      postId,
      user.id,
      dto.content,
      dto.parentId
    );
    return this.mapToResponse(comment, false);
  }

  @Get()
  @ApiOperation({ summary: "Get comments for a post" })
  async getComments(
    @Param("postId") postId: string,
    @Query() query: CommentsQueryDto
  ) {
    const comments = await this.commentsService.getPostComments(
      postId,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
    return comments.map((comment) => this.mapToResponse(comment, false));
  }

  @Get(":commentId/replies")
  @ApiOperation({ summary: "Get replies to a comment" })
  async getReplies(
    @Param("commentId") commentId: string,
    @Query() query: CommentsQueryDto
  ) {
    const replies = await this.commentsService.getReplies(
      commentId,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
    return replies.map((comment) => this.mapToResponse(comment, false));
  }

  @Delete(":commentId")
  @ApiOperation({ summary: "Delete a comment" })
  async deleteComment(
    @User() user: { id: string },
    @Param("commentId") commentId: string
  ) {
    await this.commentsService.deleteComment(commentId, user.id);
    return { success: true };
  }

  @Post(":commentId/like")
  @ApiOperation({ summary: "Like a comment" })
  async likeComment(
    @User() user: { id: string },
    @Param("commentId") commentId: string
  ) {
    await this.likesService.likeComment(user.id, commentId);
    return { success: true };
  }

  @Delete(":commentId/like")
  @ApiOperation({ summary: "Unlike a comment" })
  async unlikeComment(
    @User() user: { id: string },
    @Param("commentId") commentId: string
  ) {
    await this.likesService.unlikeComment(user.id, commentId);
    return { success: true };
  }

  private mapToResponse(comment: any, hasLiked: boolean) {
    return {
      id: comment.id,
      postId: comment.postId,
      content: comment.content,
      likeCount: comment.likeCount,
      createdAt: comment.createdAt,
      parentId: comment.parentId,
      author: comment.author
        ? {
            id: comment.author.id,
            name: comment.author.name,
            image: comment.author.image,
          }
        : { id: comment.authorId, name: "", image: null },
      hasLiked,
    };
  }
}
