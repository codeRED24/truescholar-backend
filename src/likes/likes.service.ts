import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  forwardRef,
} from "@nestjs/common";
import { IEventBus, EVENT_BUS } from "../shared/events";
import { LikeRepository } from "./like.repository";
import { PostsService } from "../posts/post.service";
import { CommentsService } from "../comments/comments.service";
import { DomainEvent } from "../shared/events/domain-event";

// Events
export class PostLikedEvent extends DomainEvent {
  readonly eventType = "likes.post.liked";
  constructor(
    public readonly postId: string,
    public readonly likerId: string,
    public readonly authorId: string
  ) {
    super(postId);
  }
  protected getPayload() {
    return {
      postId: this.postId,
      likerId: this.likerId,
      authorId: this.authorId,
    };
  }
}

export class PostUnlikedEvent extends DomainEvent {
  readonly eventType = "likes.post.unliked";
  constructor(
    public readonly postId: string,
    public readonly userId: string
  ) {
    super(postId);
  }
  protected getPayload() {
    return { postId: this.postId, userId: this.userId };
  }
}

export class CommentLikedEvent extends DomainEvent {
  readonly eventType = "likes.comment.liked";
  constructor(
    public readonly commentId: string,
    public readonly likerId: string,
    public readonly commentAuthorId: string
  ) {
    super(commentId);
  }
  protected getPayload() {
    return {
      commentId: this.commentId,
      likerId: this.likerId,
      commentAuthorId: this.commentAuthorId,
    };
  }
}

@Injectable()
export class LikesService {
  constructor(
    private readonly likeRepository: LikeRepository,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  async likePost(userId: string, postId: string): Promise<void> {
    const post = await this.postsService.findById(postId);
    if (!post) throw new NotFoundException("Post not found");

    const hasLiked = await this.likeRepository.hasLikedPost(userId, postId);
    if (hasLiked) throw new ConflictException("Already liked this post");

    await this.likeRepository.likePost(userId, postId);
    await this.postsService.incrementLikeCount(postId);

    if (userId !== post.authorId) {
      await this.eventBus.publish(
        new PostLikedEvent(postId, userId, post.authorId)
      );
    }
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const removed = await this.likeRepository.unlikePost(userId, postId);
    if (removed) {
      await this.postsService.decrementLikeCount(postId);
      await this.eventBus.publish(new PostUnlikedEvent(postId, userId));
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
      await this.eventBus.publish(
        new CommentLikedEvent(commentId, userId, comment.authorId)
      );
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
}
