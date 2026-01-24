import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { KAFKA_SERVICE } from "../shared/kafka/kafka.module";
import { Comment } from "./comment.entity";
import { CommentRepository } from "./comment.repository";
import { PostsService } from "../posts/post.service";
import { randomUUID } from "crypto";
import { AuthorType } from "../common/enums";

@Injectable()
export class CommentsService implements OnModuleInit {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postsService: PostsService,
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async addComment(
    postId: string,
    authorId: string,
    content: string,
    parentId?: string,
    authorType?: AuthorType,
    collegeId?: number
  ): Promise<Comment> {
    const post = await this.postsService.findById(postId);
    if (!post) throw new NotFoundException("Post not found");

    if (parentId) {
      const parent = await this.commentRepository.findById(parentId);
      if (!parent || parent.postId !== postId)
        throw new NotFoundException("Parent comment not found");
    }

    const comment = await this.commentRepository.create({
      postId,
      authorId,
      content,
      parentId,
      authorType,
      collegeId,
    });
    const newCommentCount =
      await this.postsService.incrementCommentCount(postId);

    this.kafkaClient.emit("content.comment.created", {
      eventId: randomUUID(),
      eventType: "content.comment.created",
      aggregateId: comment.id,
      occurredAt: new Date().toISOString(),
      payload: {
        commentId: comment.id,
        postId,
        authorId,
        authorType: authorType || AuthorType.USER,
        collegeId: collegeId || null,
        postAuthorId: post.authorId,
        parentId: parentId || null,
        postCommentCount: newCommentCount,
      },
    });

    return comment;
  }

  async getPostComments(
    postId: string,
    page: number,
    limit: number,
    cursor?: string
  ): Promise<Comment[]> {
    return this.commentRepository.getPostComments(postId, page, limit, cursor);
  }

  async getReplies(
    parentId: string,
    page: number,
    limit: number
  ): Promise<Comment[]> {
    return this.commentRepository.getReplies(parentId, page, limit);
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.authorId !== userId)
      throw new ForbiddenException("You can only delete your own comments");

    await this.commentRepository.softDelete(commentId);
    const newCommentCount = await this.postsService.decrementCommentCount(
      comment.postId
    );

    this.kafkaClient.emit("content.comment.deleted", {
      eventId: randomUUID(),
      eventType: "content.comment.deleted",
      aggregateId: commentId,
      occurredAt: new Date().toISOString(),
      payload: {
        commentId,
        postId: comment.postId,
        authorId: comment.authorId,
        postCommentCount: newCommentCount,
      },
    });
  }

  async findById(commentId: string): Promise<Comment | null> {
    return this.commentRepository.findById(commentId);
  }

  async incrementLikeCount(commentId: string): Promise<void> {
    await this.commentRepository.incrementLikeCount(commentId);
  }

  async decrementLikeCount(commentId: string): Promise<void> {
    await this.commentRepository.decrementLikeCount(commentId);
  }
}
