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

  async likePost(userId: string, postId: string): Promise<void> {
    const post = await this.postsService.findById(postId);
    if (!post) throw new NotFoundException("Post not found");

    const hasLiked = await this.likeRepository.hasLikedPost(userId, postId);
    if (hasLiked) throw new ConflictException("Already liked this post");

    await this.likeRepository.likePost(userId, postId);
    await this.postsService.incrementLikeCount(postId);

    if (userId !== post.authorId) {
      this.kafkaClient.emit("likes.post.liked", {
        eventId: randomUUID(),
        eventType: "likes.post.liked",
        aggregateId: postId,
        occurredAt: new Date().toISOString(),
        payload: {
          postId,
          likerId: userId,
          authorId: post.authorId,
        },
      });
    }
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const removed = await this.likeRepository.unlikePost(userId, postId);
    if (removed) {
      await this.postsService.decrementLikeCount(postId);

      this.kafkaClient.emit("likes.post.unliked", {
        eventId: randomUUID(),
        eventType: "likes.post.unliked",
        aggregateId: postId,
        occurredAt: new Date().toISOString(),
        payload: { postId, userId },
      });
    }
  }

  async likeComment(userId: string, commentId: string): Promise<void> {
    const comment = await this.commentsService.findById(commentId);
    if (!comment) throw new NotFoundException("Comment not found");

    const hasLiked = await this.likeRepository.hasLikedComment(
      userId,
      commentId
    );
    if (hasLiked) throw new ConflictException("Already liked this comment");

    await this.likeRepository.likeComment(userId, commentId);
    await this.commentsService.incrementLikeCount(commentId);

    if (userId !== comment.authorId) {
      this.kafkaClient.emit("likes.comment.liked", {
        eventId: randomUUID(),
        eventType: "likes.comment.liked",
        aggregateId: commentId,
        occurredAt: new Date().toISOString(),
        payload: {
          commentId,
          likerId: userId,
          commentAuthorId: comment.authorId,
        },
      });
    }
  }

  async unlikeComment(userId: string, commentId: string): Promise<void> {
    const removed = await this.likeRepository.unlikeComment(userId, commentId);
    if (removed) {
      await this.commentsService.decrementLikeCount(commentId);
    }
  }

  async hasLikedPost(userId: string, postId: string): Promise<boolean> {
    return this.likeRepository.hasLikedPost(userId, postId);
  }

  async hasLikedComment(userId: string, commentId: string): Promise<boolean> {
    return this.likeRepository.hasLikedComment(userId, commentId);
  }

  async getLikeStatusForPosts(
    userId: string,
    postIds: string[]
  ): Promise<Map<string, boolean>> {
    return this.likeRepository.getLikeStatusForPosts(userId, postIds);
  }

  async getLikeStatusForComments(
    userId: string,
    commentIds: string[]
  ): Promise<Map<string, boolean>> {
    return this.likeRepository.getLikeStatusForComments(userId, commentIds);
  }
}
