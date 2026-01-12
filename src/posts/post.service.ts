import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
  forwardRef,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { KAFKA_SERVICE } from "../shared/kafka/kafka.module";
import { Post, PostVisibility, PostMedia } from "./post.entity";
import { PostRepository } from "./post.repository";
import { FeedCacheService } from "../feed/feed-cache.service";
import { AuthorType, PostType } from "@/common/enums";
import { randomUUID } from "crypto";

@Injectable()
export class PostsService implements OnModuleInit {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    @Inject(forwardRef(() => FeedCacheService))
    private readonly feedCacheService: FeedCacheService
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

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

    this.kafkaClient.emit("post.created", {
      eventId: randomUUID(),
      eventType: "post.created",
      aggregateId: post.id,
      occurredAt: new Date().toISOString(),
      payload: {
        postId: post.id,
        authorId,
        visibility: post.visibility,
        content,
      },
    });

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
    const updatedPost = (await this.postRepository.update(postId, {
      content,
      media,
      visibility,
      type,
      taggedCollegeId,
    })) as Post;

    // Emit update event for search indexing
    const finalContent = content || post.content;
    this.kafkaClient.emit("post.updated", {
      eventId: randomUUID(),
      eventType: "post.updated",
      aggregateId: postId,
      occurredAt: new Date().toISOString(),
      payload: { postId, content: finalContent },
    });

    return updatedPost;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    if (post.authorId !== userId)
      throw new ForbiddenException("You can only delete your own posts");
    await this.postRepository.softDelete(postId);

    this.kafkaClient.emit("post.deleted", {
      eventId: randomUUID(),
      eventType: "post.deleted",
      aggregateId: postId,
      occurredAt: new Date().toISOString(),
      payload: { postId, authorId: userId },
    });
  }

  // Called by likes module
  async incrementLikeCount(postId: string): Promise<void> {
    await this.postRepository.incrementLikeCount(postId);
    await this.feedCacheService.invalidatePost(postId);
  }

  async decrementLikeCount(postId: string): Promise<void> {
    await this.postRepository.decrementLikeCount(postId);
    await this.feedCacheService.invalidatePost(postId);
  }

  // Called by comments module
  async incrementCommentCount(postId: string): Promise<void> {
    await this.postRepository.incrementCommentCount(postId);
    await this.feedCacheService.invalidatePost(postId);
  }

  async decrementCommentCount(postId: string): Promise<void> {
    await this.postRepository.decrementCommentCount(postId);
    await this.feedCacheService.invalidatePost(postId);
  }

  async findById(postId: string): Promise<Post | null> {
    return this.postRepository.findById(postId);
  }
}
