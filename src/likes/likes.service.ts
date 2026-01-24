import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  forwardRef,
  OnModuleInit,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { KAFKA_SERVICE } from "../shared/kafka/kafka.module";
import { LikeRepository } from "./like.repository";
import { PostsService } from "../posts/post.service";
import { CommentsService } from "../comments/comments.service";
import { randomUUID } from "crypto";
import { AuthorType } from "../common/enums";

@Injectable()
export class LikesService implements OnModuleInit {
  constructor(
    private readonly likeRepository: LikeRepository,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async likePost(
    userId: string,
    postId: string,
    authorType?: AuthorType,
    collegeId?: number
  ): Promise<void> {
    const post = await this.postsService.findById(postId);
    if (!post) throw new NotFoundException("Post not found");

    const hasLiked = await this.likeRepository.hasLikedPost(
      userId,
      postId,
      authorType,
      collegeId
    );
    if (hasLiked) throw new ConflictException("Already liked this post");

    await this.likeRepository.likePost(userId, postId, authorType, collegeId);
    const newLikeCount = await this.postsService.incrementLikeCount(postId);

    // Always emit event for cache update
    this.kafkaClient.emit("engagement.post.liked", {
      eventId: randomUUID(),
      eventType: "engagement.post.liked",
      aggregateId: postId,
      occurredAt: new Date().toISOString(),
      payload: {
        postId,
        likerId: userId,
        authorId: post.authorId,
        likeCount: newLikeCount,
        authorType: authorType || AuthorType.USER,
        collegeId: collegeId || null,
      },
    });
  }

  async unlikePost(
    userId: string,
    postId: string,
    authorType?: AuthorType,
    collegeId?: number
  ): Promise<void> {
    const removed = await this.likeRepository.unlikePost(
      userId,
      postId,
      authorType,
      collegeId
    );
    if (removed) {
      const newLikeCount = await this.postsService.decrementLikeCount(postId);

      this.kafkaClient.emit("engagement.post.unliked", {
        eventId: randomUUID(),
        eventType: "engagement.post.unliked",
        aggregateId: postId,
        occurredAt: new Date().toISOString(),
        payload: {
          postId,
          userId,
          likeCount: newLikeCount,
          authorType: authorType || AuthorType.USER,
          collegeId: collegeId || null,
        },
      });
    }
  }

  async likeComment(
    userId: string,
    commentId: string,
    authorType?: AuthorType,
    collegeId?: number
  ): Promise<void> {
    const comment = await this.commentsService.findById(commentId);
    if (!comment) throw new NotFoundException("Comment not found");

    const hasLiked = await this.likeRepository.hasLikedComment(
      userId,
      commentId,
      authorType,
      collegeId
    );
    if (hasLiked) throw new ConflictException("Already liked this comment");

    await this.likeRepository.likeComment(
      userId,
      commentId,
      authorType,
      collegeId
    );
    await this.commentsService.incrementLikeCount(commentId);

    if (userId !== comment.authorId) {
      this.kafkaClient.emit("engagement.comment.liked", {
        eventId: randomUUID(),
        eventType: "engagement.comment.liked",
        aggregateId: commentId,
        occurredAt: new Date().toISOString(),
        payload: {
          commentId,
          postId: comment.postId,
          likerId: userId,
          commentAuthorId: comment.authorId,
          likeCount: 0, // TODO: Get actual like count
          authorType: authorType || AuthorType.USER,
          collegeId: collegeId || null,
        },
      });
    }
  }

  async unlikeComment(
    userId: string,
    commentId: string,
    authorType?: AuthorType,
    collegeId?: number
  ): Promise<void> {
    const removed = await this.likeRepository.unlikeComment(
      userId,
      commentId,
      authorType,
      collegeId
    );
    if (removed) {
      await this.commentsService.decrementLikeCount(commentId);
    }
  }

  async hasLikedPost(
    userId: string,
    postId: string,
    authorType?: AuthorType,
    collegeId?: number
  ): Promise<boolean> {
    return this.likeRepository.hasLikedPost(
      userId,
      postId,
      authorType,
      collegeId
    );
  }

  async hasLikedComment(
    userId: string,
    commentId: string,
    authorType?: AuthorType,
    collegeId?: number
  ): Promise<boolean> {
    return this.likeRepository.hasLikedComment(
      userId,
      commentId,
      authorType,
      collegeId
    );
  }

  async getLikeStatusForPosts(
    userId: string,
    postIds: string[],
    authorType?: AuthorType,
    collegeId?: number
  ): Promise<Map<string, boolean>> {
    return this.likeRepository.getLikeStatusForPosts(
      userId,
      postIds,
      authorType,
      collegeId
    );
  }

  async getLikeStatusForComments(
    userId: string,
    commentIds: string[],
    authorType?: AuthorType,
    collegeId?: number
  ): Promise<Map<string, boolean>> {
    return this.likeRepository.getLikeStatusForComments(
      userId,
      commentIds,
      authorType,
      collegeId
    );
  }
}
