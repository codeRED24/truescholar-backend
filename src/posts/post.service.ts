import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { IEventBus, EVENT_BUS } from "../shared/events";
import { Post, PostVisibility, PostMedia } from "./post.entity";
import { PostRepository } from "./post.repository";
import { AuthorType, PostType } from "@/common/enums";

// Events
import { DomainEvent } from "../shared/events/domain-event";

export class PostCreatedEvent extends DomainEvent {
  readonly eventType = "posts.created";
  constructor(
    public readonly postId: string,
    public readonly authorId: string,
    public readonly visibility: string
  ) {
    super(postId);
  }
  protected getPayload() {
    return {
      postId: this.postId,
      authorId: this.authorId,
      visibility: this.visibility,
    };
  }
}

export class PostDeletedEvent extends DomainEvent {
  readonly eventType = "posts.deleted";
  constructor(
    public readonly postId: string,
    public readonly authorId: string
  ) {
    super(postId);
  }
  protected getPayload() {
    return { postId: this.postId, authorId: this.authorId };
  }
}

@Injectable()
export class PostsService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  async createPost(
    authorId: string,
    content: string,
    media?: PostMedia[],
    visibility?: PostVisibility,
    authorType?: AuthorType,
    type?: PostType,
    taggedCollegeId?: number
  ): Promise<Post> {
    const post = await this.postRepository.create({
      authorId,
      content,
      media,
      visibility,
      authorType,
      type,
      taggedCollegeId,
    });
    await this.eventBus.publish(
      new PostCreatedEvent(post.id, authorId, post.visibility)
    );
    return post;
  }

  async getPost(
    postId: string,
    requesterId?: string,
    areConnected?: (a: string, b: string) => Promise<boolean>
  ): Promise<Post> {
    const post = await this.postRepository.findByIdWithAuthor(postId);
    if (!post) throw new NotFoundException("Post not found");

    if (post.visibility !== PostVisibility.PUBLIC && requesterId) {
      if (post.authorId !== requesterId) {
        if (post.visibility === PostVisibility.PRIVATE) {
          throw new ForbiddenException("This post is private");
        }
        if (post.visibility === PostVisibility.CONNECTIONS && areConnected) {
          const connected = await areConnected(post.authorId, requesterId);
          if (!connected)
            throw new ForbiddenException(
              "This post is only visible to connections"
            );
        }
      }
    }
    return post;
  }

  async getFeed(
    userId: string,
    connectionIds: string[],
    page: number,
    limit: number
  ): Promise<Post[]> {
    return this.postRepository.getFeedForUser(
      userId,
      connectionIds,
      page,
      limit
    );
  }

  async updatePost(
    postId: string,
    userId: string,
    content?: string,
    media?: PostMedia[],
    visibility?: PostVisibility,
    type?: PostType,
    taggedCollegeId?: number
  ): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    if (post.authorId !== userId)
      throw new ForbiddenException("You can only edit your own posts");
    return this.postRepository.update(postId, {
      content,
      media,
      visibility,
      type,
      taggedCollegeId,
    }) as Promise<Post>;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    if (post.authorId !== userId)
      throw new ForbiddenException("You can only delete your own posts");
    await this.postRepository.softDelete(postId);
    await this.eventBus.publish(new PostDeletedEvent(postId, userId));
  }

  // Called by likes module
  async incrementLikeCount(postId: string): Promise<void> {
    await this.postRepository.incrementLikeCount(postId);
  }

  async decrementLikeCount(postId: string): Promise<void> {
    await this.postRepository.decrementLikeCount(postId);
  }

  // Called by comments module
  async incrementCommentCount(postId: string): Promise<void> {
    await this.postRepository.incrementCommentCount(postId);
  }

  async decrementCommentCount(postId: string): Promise<void> {
    await this.postRepository.decrementCommentCount(postId);
  }

  async findById(postId: string): Promise<Post | null> {
    return this.postRepository.findById(postId);
  }
}
