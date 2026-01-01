import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { IEventBus, EVENT_BUS } from "../shared/events";
import { Comment } from "./comment.entity";
import { CommentRepository } from "./comment.repository";
import { PostsService } from "../posts/post.service";
import { DomainEvent } from "../shared/events/domain-event";

// Events
export class CommentAddedEvent extends DomainEvent {
  readonly eventType = "comments.added";
  constructor(
    public readonly commentId: string,
    public readonly postId: string,
    public readonly authorId: string,
    public readonly postAuthorId: string,
    public readonly parentCommentId: string | null
  ) {
    super(commentId);
  }
  protected getPayload() {
    return {
      commentId: this.commentId,
      postId: this.postId,
      authorId: this.authorId,
      postAuthorId: this.postAuthorId,
      parentCommentId: this.parentCommentId,
    };
  }
}

export class CommentDeletedEvent extends DomainEvent {
  readonly eventType = "comments.deleted";
  constructor(
    public readonly commentId: string,
    public readonly postId: string
  ) {
    super(commentId);
  }
  protected getPayload() {
    return { commentId: this.commentId, postId: this.postId };
  }
}

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postsService: PostsService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  async addComment(
    postId: string,
    authorId: string,
    content: string,
    parentId?: string
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
    });
    await this.postsService.incrementCommentCount(postId);
    await this.eventBus.publish(
      new CommentAddedEvent(
        comment.id,
        postId,
        authorId,
        post.authorId,
        parentId || null
      )
    );
    return comment;
  }

  async getPostComments(
    postId: string,
    page: number,
    limit: number
  ): Promise<Comment[]> {
    return this.commentRepository.getPostComments(postId, page, limit);
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
    await this.postsService.decrementCommentCount(comment.postId);
    await this.eventBus.publish(
      new CommentDeletedEvent(commentId, comment.postId)
    );
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
