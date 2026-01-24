import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan, In } from "typeorm";
import { ClientKafka } from "@nestjs/microservices";
import { Cron, CronExpression } from "@nestjs/schedule";
import { KAFKA_SERVICE } from "../shared/kafka/kafka.module";
import { Post, PostVisibility, PostMedia } from "./post.entity";
import { PostMediaUpload, MediaType } from "./post-media-upload.entity";
import { EntityHandle } from "../handles/entity-handle.entity";
import { PostRepository } from "./post.repository";
import { FileUploadService } from "../utils/file-upload/fileUpload.service";
import { AuthorType, PostType, CollegeRole } from "@/common/enums";
import { randomUUID } from "crypto";
import { File } from "@nest-lab/fastify-multer";

import { HandlesService } from "../handles/handles.service";
import { CollegeMemberService } from "../college-member/college-member.service";

@Injectable()
export class PostsService implements OnModuleInit {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly postRepository: PostRepository,
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka,
    @InjectRepository(PostMediaUpload)
    private readonly mediaUploadRepository: Repository<PostMediaUpload>,
    private readonly fileUploadService: FileUploadService,
    private readonly handlesService: HandlesService,
    private readonly collegeMemberService: CollegeMemberService
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
    // Verify permission if posting as college
    if (authorType === AuthorType.COLLEGE) {
      if (!taggedCollegeId) {
        throw new ForbiddenException(
          "taggedCollegeId is required when posting as a college"
        );
      }

      const membership = await this.collegeMemberService.getMembership(
        taggedCollegeId,
        authorId
      );

      if (!membership || membership.role !== CollegeRole.COLLEGE_ADMIN) {
        throw new ForbiddenException(
          "You do not have permission to post as this college"
        );
      }
    }

    const mentions = await this.processMentions(content);

    const post = await this.postRepository.create({
      authorId,
      content,
      media,
      visibility,
      authorType,
      type,
      taggedCollegeId,
      mentions,
    });

    // Mark media as used so it won't be cleaned up
    if (media && media.length > 0) {
      const mediaUrls = media.map((m) => m.url);
      await this.markMediaAsUsed(mediaUrls, authorId);
    }

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
        mentionCount: mentions.length,
      },
    });

    return post;
  }

  private async processMentions(content: string): Promise<EntityHandle[]> {
    if (!content) return [];
    
    // Regex to find @handle (alphanumeric + underscore) OR react-mentions format @[display](handle)
    const simpleMentionRegex = /@([a-zA-Z0-9_]+)/g;
    const markupMentionRegex = /@\[[^\]]+\]\(([a-zA-Z0-9_]+)\)/g;

    const simpleMatches = [...content.matchAll(simpleMentionRegex)].map(m => m[1]);
    const markupMatches = [...content.matchAll(markupMentionRegex)].map(m => m[1]);
    
    const handles = [...simpleMatches, ...markupMatches];
    
    if (handles.length === 0) return [];
    
    // Remove duplicates
    const uniqueHandles = [...new Set(handles)];
    
    return this.handlesService.findByHandles(uniqueHandles);
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

    let mentions: EntityHandle[] | undefined;
    if (content !== undefined) {
      mentions = await this.processMentions(content);
    }

    const updatedPost = (await this.postRepository.update(postId, {
      content,
      media,
      visibility,
      type,
      taggedCollegeId,
      mentions,
    })) as Post;

    // Emit update event for cache invalidation and search indexing
    const changedFields: string[] = [];
    if (content !== undefined) changedFields.push("content");
    if (media !== undefined) changedFields.push("media");
    if (visibility !== undefined) changedFields.push("visibility");
    if (type !== undefined) changedFields.push("type");
    if (taggedCollegeId !== undefined) changedFields.push("taggedCollegeId");
    if (mentions !== undefined) changedFields.push("mentions");

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

  // ===== Media Upload Methods =====

  /**
   * Upload a media file for a post. File is stored in S3 and tracked in DB.
   * Initially marked as unused - will be marked as used when attached to a post.
   */
  async uploadMedia(
    file: File,
    uploaderId: string
  ): Promise<{ url: string; type: MediaType }> {
    // Determine media type from mimetype
    let mediaType: MediaType = MediaType.IMAGE;
    if (file.mimetype.startsWith("video/")) {
      mediaType = MediaType.VIDEO;
    } else if (
      file.mimetype.startsWith("application/") ||
      file.mimetype === "text/plain"
    ) {
      mediaType = MediaType.DOCUMENT;
    }

    // Upload to S3
    const url = await this.fileUploadService.uploadFile(
      file,
      "posts-media",
      uploaderId
    );

    // Track in database as unused
    const mediaUpload = this.mediaUploadRepository.create({
      url,
      type: mediaType,
      uploaderId,
    });
    await this.mediaUploadRepository.save(mediaUpload);

    this.logger.log(`Media uploaded: ${url} by user ${uploaderId}`);

    return { url, type: mediaType };
  }

  /**
   * Mark media URLs as used (called when a post is created with these URLs).
   * Deletes the tracking record, as it's no longer temporary.
   */
  async markMediaAsUsed(urls: string[], userId: string): Promise<void> {
    if (!urls || urls.length === 0) return;

    await this.mediaUploadRepository.delete({
      url: In(urls),
      uploaderId: userId,
    });

    this.logger.log(`Marked ${urls.length} media items as used (deleted tracking) for user ${userId}`);
  }

  /**
   * Cleanup orphaned media files.
   * Runs daily at midnight. Deletes unused media older than 24 hours.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOrphanedMedia(): Promise<void> {
    this.logger.log("Starting orphaned media cleanup...");

    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24);

    // Find unused media older than 24 hours
    const orphanedMedia = await this.mediaUploadRepository.find({
      where: {
        createdAt: LessThan(cutoffDate),
      },
    });

    if (orphanedMedia.length === 0) {
      this.logger.log("No orphaned media to cleanup.");
      return;
    }

    this.logger.log(`Found ${orphanedMedia.length} orphaned media files to delete.`);

    // Delete from S3 and database
    for (const media of orphanedMedia) {
      try {
        await this.fileUploadService.deleteFileByPath(media.url);
        await this.mediaUploadRepository.delete(media.id);
        this.logger.log(`Deleted orphaned media: ${media.url}`);
      } catch (error) {
        this.logger.error(`Failed to delete orphaned media ${media.url}:`, error);
      }
    }

    this.logger.log(`Orphaned media cleanup complete. Deleted ${orphanedMedia.length} files.`);
  }
}
