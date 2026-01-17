import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { KAFKA_SERVICE } from "../shared/kafka/kafka.module";
import { Post, PostVisibility, PostMedia } from "./post.entity";
import { PostRepository } from "./post.repository";
import { AuthorType, PostType } from "@/common/enums";
import { randomUUID } from "crypto";

@Injectable()
export class PostsService implements OnModuleInit {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka
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

    this.kafkaClient.emit("posts.post.created", {
      eventId: randomUUID(),
      eventType: "posts.post.created",
      aggregateId: post.id,
      occurredAt: new Date().toISOString(),
      payload: {
        postId: post.id,
        authorId,
        visibility: post.visibility,
        content,
        mediaCount: media?.length || 0,
        taggedCollegeId,
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

    // Emit update event for cache invalidation and search indexing
    const changedFields: string[] = [];
    if (content !== undefined) changedFields.push("content");
    if (media !== undefined) changedFields.push("media");
    if (visibility !== undefined) changedFields.push("visibility");
    if (type !== undefined) changedFields.push("type");
    if (taggedCollegeId !== undefined) changedFields.push("taggedCollegeId");

    this.kafkaClient.emit("posts.post.updated", {
      eventId: randomUUID(),
      eventType: "posts.post.updated",
      aggregateId: postId,
      occurredAt: new Date().toISOString(),
      payload: {
        postId,
        authorId: userId,
        content,
        visibility,
        changedFields,
      },
    });

    return updatedPost;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new NotFoundException("Post not found");
    if (post.authorId !== userId)
      throw new ForbiddenException("You can only delete your own posts");
    await this.postRepository.softDelete(postId);

    this.kafkaClient.emit("posts.post.deleted", {
      eventId: randomUUID(),
      eventType: "posts.post.deleted",
      aggregateId: postId,
      occurredAt: new Date().toISOString(),
      payload: { postId, authorId: userId },
    });
  }

  // Called by likes module - cache update now happens via event
  async incrementLikeCount(postId: string): Promise<number> {
    await this.postRepository.incrementLikeCount(postId);
    const post = await this.postRepository.findById(postId);
    return post?.likeCount ?? 0;
  }

  async decrementLikeCount(postId: string): Promise<number> {
    await this.postRepository.decrementLikeCount(postId);
    const post = await this.postRepository.findById(postId);
    return post?.likeCount ?? 0;
  }

  // Called by comments module - cache update now happens via event
  async incrementCommentCount(postId: string): Promise<number> {
    await this.postRepository.incrementCommentCount(postId);
    const post = await this.postRepository.findById(postId);
    return post?.commentCount ?? 0;
  }

  async decrementCommentCount(postId: string): Promise<number> {
    await this.postRepository.decrementCommentCount(postId);
    const post = await this.postRepository.findById(postId);
    return post?.commentCount ?? 0;
  }

  async findById(postId: string): Promise<Post | null> {
    return this.postRepository.findById(postId);
  }
}
