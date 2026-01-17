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
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";
import { CommentsService } from "./comments.service";
import { CommentRepository } from "./comment.repository";
import { CommentsQueryDto, CreateCommentDto } from "./comment.dto";
import { LikesService } from "src/likes/likes.service";

@ApiTags("Comments")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("posts/:postId/comments")
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commentRepository: CommentRepository,
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
    return this.mapToResponse(comment, false, 0);
  }

  @Get()
  @ApiOperation({ summary: "Get comments for a post" })
  async getComments(
    @User() user: { id: string },
    @Param("postId") postId: string,
    @Query() query: CommentsQueryDto
  ) {
    const limit = Math.min(query.limit || 10, 50);
    const comments = await this.commentsService.getPostComments(
      postId,
      query.page || 1,
      limit + 1, // Fetch one extra to determine if there are more
      query.cursor
    );

    const hasMore = comments.length > limit;
    const displayComments = hasMore ? comments.slice(0, limit) : comments;

    // Batch fetch reply counts and like statuses for all comments
    const commentIds = displayComments.map((c) => c.id);
    const [replyCounts, likeStatuses] = await Promise.all([
      this.commentRepository.getReplyCountsForComments(commentIds),
      this.likesService.getLikeStatusForComments(user.id, commentIds),
    ]);

    // Use the last comment's createdAt as cursor for pagination
    const nextCursor =
      hasMore && displayComments.length > 0
        ? `${displayComments[
            displayComments.length - 1
          ].createdAt.toISOString()}_${displayComments[displayComments.length - 1].id}`
        : null;

    return {
      comments: displayComments.map((comment) =>
        this.mapToResponse(
          comment,
          likeStatuses.get(comment.id) || false,
          replyCounts.get(comment.id) || 0
        )
      ),
      nextCursor,
    };
  }

  @Get(":commentId/replies")
  @ApiOperation({ summary: "Get replies to a comment" })
  async getReplies(
    @User() user: { id: string },
    @Param("commentId") commentId: string,
    @Query() query: CommentsQueryDto
  ) {
    const replies = await this.commentsService.getReplies(
      commentId,
      query.page || 1,
      Math.min(query.limit || 10, 50)
    );

    // Fetch like statuses and reply counts for replies
    const replyIds = replies.map((r) => r.id);
    const [likeStatuses, replyCounts] = await Promise.all([
      this.likesService.getLikeStatusForComments(user.id, replyIds),
      this.commentRepository.getReplyCountsForComments(replyIds),
    ]);

    return replies.map((comment) =>
      this.mapToResponse(
        comment,
        likeStatuses.get(comment.id) || false,
        replyCounts.get(comment.id) || 0
      )
    );
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
  @UseGuards(ThrottlerGuard)
  @Throttle({ like: { limit: 30, ttl: 60000 } })
  async likeComment(
    @User() user: { id: string },
    @Param("commentId") commentId: string
  ) {
    await this.likesService.likeComment(user.id, commentId);
    return { success: true };
  }

  @Delete(":commentId/like")
  @ApiOperation({ summary: "Unlike a comment" })
  @UseGuards(ThrottlerGuard)
  @Throttle({ like: { limit: 30, ttl: 60000 } })
  async unlikeComment(
    @User() user: { id: string },
    @Param("commentId") commentId: string
  ) {
    await this.likesService.unlikeComment(user.id, commentId);
    return { success: true };
  }

  private mapToResponse(comment: any, hasLiked: boolean, replyCount: number) {
    return {
      id: comment.id,
      postId: comment.postId,
      content: comment.content,
      likeCount: comment.likeCount,
      replyCount,
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
