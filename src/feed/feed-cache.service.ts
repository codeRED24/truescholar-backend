import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { Post } from "../posts/post.entity";

// Threshold for celebrity treatment (fan-out on read vs write)
export const CELEBRITY_THRESHOLD = 1000;

// TTLs in seconds
const TIMELINE_TTL = 7 * 24 * 60 * 60; // 7 days
const POST_CACHE_TTL = 60 * 60; // 1 hour
const CONNECTION_CACHE_TTL = 5 * 60; // 5 minutes

// Max entries
const TIMELINE_MAX_SIZE = 500;
const CELEBRITY_POSTS_MAX_SIZE = 100;

@Injectable()
export class FeedCacheService {
  private redis: Redis | null = null;

  constructor() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 100, 3000);
        },
      });

      this.redis.on("error", (err) => {
        console.error("[FeedCache] Redis error:", err.message);
      });
    } catch (error) {
      console.error("[FeedCache] Failed to connect to Redis:", error);
      this.redis = null;
    }
  }

  // ============================================
  // Timeline Operations (Sorted Set)
  // ============================================

  /**
   * Get post IDs from user's timeline with cursor-based pagination
   */
  async getTimeline(
    userId: string,
    cursor: string | undefined,
    limit: number
  ): Promise<{ postIds: string[]; scores: number[] } | null> {
    if (!this.redis) return null;

    try {
      const maxScore = cursor ? parseFloat(cursor) - 1 : "+inf";
      const results = await this.redis.zrevrangebyscore(
        `timeline:${userId}`,
        maxScore,
        "-inf",
        "WITHSCORES",
        "LIMIT",
        0,
        limit + 1
      );

      // Parse results: [id1, score1, id2, score2, ...]
      const postIds: string[] = [];
      const scores: number[] = [];
      for (let i = 0; i < results.length; i += 2) {
        postIds.push(results[i]);
        scores.push(parseFloat(results[i + 1]));
      }

      return { postIds, scores };
    } catch (error) {
      console.error("[FeedCache] getTimeline error:", error);
      return null;
    }
  }

  /**
   * Add a post to a user's timeline
   */
  async addToTimeline(
    userId: string,
    postId: string,
    timestamp: number
  ): Promise<void> {
    if (!this.redis) return;

    try {
      const pipeline = this.redis.pipeline();
      pipeline.zadd(`timeline:${userId}`, timestamp, postId);
      pipeline.zremrangebyrank(`timeline:${userId}`, 0, -TIMELINE_MAX_SIZE - 1);
      pipeline.expire(`timeline:${userId}`, TIMELINE_TTL);
      await pipeline.exec();
    } catch (error) {
      console.error("[FeedCache] addToTimeline error:", error);
    }
  }

  /**
   * Add post to multiple timelines (batch fan-out)
   */
  async addToTimelines(
    userIds: string[],
    postId: string,
    timestamp: number
  ): Promise<void> {
    if (!this.redis || userIds.length === 0) return;

    try {
      const pipeline = this.redis.pipeline();
      for (const userId of userIds) {
        pipeline.zadd(`timeline:${userId}`, timestamp, postId);
        pipeline.zremrangebyrank(
          `timeline:${userId}`,
          0,
          -TIMELINE_MAX_SIZE - 1
        );
      }
      await pipeline.exec();
    } catch (error) {
      console.error("[FeedCache] addToTimelines error:", error);
    }
  }

  /**
   * Remove a post from a user's timeline
   */
  async removeFromTimeline(userId: string, postId: string): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.zrem(`timeline:${userId}`, postId);
    } catch (error) {
      console.error("[FeedCache] removeFromTimeline error:", error);
    }
  }

  /**
   * Remove post from multiple timelines
   */
  async removeFromTimelines(userIds: string[], postId: string): Promise<void> {
    if (!this.redis || userIds.length === 0) return;

    try {
      const pipeline = this.redis.pipeline();
      for (const userId of userIds) {
        pipeline.zrem(`timeline:${userId}`, postId);
      }
      await pipeline.exec();
    } catch (error) {
      console.error("[FeedCache] removeFromTimelines error:", error);
    }
  }

  // ============================================
  // Celebrity Posts Operations
  // ============================================

  /**
   * Add post to celebrity's outbox (for fan-out on read)
   */
  async addToCelebrityPosts(
    authorId: string,
    postId: string,
    timestamp: number
  ): Promise<void> {
    if (!this.redis) return;

    try {
      const pipeline = this.redis.pipeline();
      pipeline.zadd(`celebrity_posts:${authorId}`, timestamp, postId);
      pipeline.zremrangebyrank(
        `celebrity_posts:${authorId}`,
        0,
        -CELEBRITY_POSTS_MAX_SIZE - 1
      );
      pipeline.sadd("celebrities", authorId);
      pipeline.expire(`celebrity_posts:${authorId}`, TIMELINE_TTL);
      await pipeline.exec();
    } catch (error) {
      console.error("[FeedCache] addToCelebrityPosts error:", error);
    }
  }

  /**
   * Get celebrity posts for merge at read time
   */
  async getCelebrityPosts(
    celebrityIds: string[],
    cursor: string | undefined,
    limitPerCelebrity: number = 10
  ): Promise<{ postId: string; score: number }[]> {
    if (!this.redis || celebrityIds.length === 0) return [];

    try {
      const maxScore = cursor ? parseFloat(cursor) - 1 : "+inf";
      const results: { postId: string; score: number }[] = [];

      // Fetch from each celebrity in parallel
      const promises = celebrityIds.map(async (celebId) => {
        const posts = await this.redis!.zrevrangebyscore(
          `celebrity_posts:${celebId}`,
          maxScore,
          "-inf",
          "WITHSCORES",
          "LIMIT",
          0,
          limitPerCelebrity
        );

        for (let i = 0; i < posts.length; i += 2) {
          results.push({ postId: posts[i], score: parseFloat(posts[i + 1]) });
        }
      });

      await Promise.all(promises);
      return results;
    } catch (error) {
      console.error("[FeedCache] getCelebrityPosts error:", error);
      return [];
    }
  }

  /**
   * Check which of the given user IDs are celebrities
   */
  async filterCelebrities(userIds: string[]): Promise<string[]> {
    if (!this.redis || userIds.length === 0) return [];

    try {
      const pipeline = this.redis.pipeline();
      for (const userId of userIds) {
        pipeline.sismember("celebrities", userId);
      }
      const results = await pipeline.exec();

      return userIds.filter((_, idx) => results?.[idx]?.[1] === 1);
    } catch (error) {
      console.error("[FeedCache] filterCelebrities error:", error);
      return [];
    }
  }

  /**
   * Remove post from celebrity outbox
   */
  async removeFromCelebrityPosts(
    authorId: string,
    postId: string
  ): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.zrem(`celebrity_posts:${authorId}`, postId);
    } catch (error) {
      console.error("[FeedCache] removeFromCelebrityPosts error:", error);
    }
  }

  // ============================================
  // Post Cache Operations (Hash)
  // ============================================

  /**
   * Cache a post for quick hydration
   */
  async cachePost(post: Post): Promise<void> {
    if (!this.redis) return;

    try {
      const key = `post:${post.id}`;
      const data = {
        id: post.id,
        authorId: post.authorId,
        content: post.content,
        media: JSON.stringify(post.media),
        visibility: post.visibility,
        authorType: post.authorType || "",
        type: post.type || "",
        likeCount: String(post.likeCount),
        commentCount: String(post.commentCount),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        "author.id": post.author?.id || "",
        "author.name": post.author?.name || "",
        "author.image": post.author?.image || "",
      };

      await this.redis.hset(key, data);
      await this.redis.expire(key, POST_CACHE_TTL);
    } catch (error) {
      console.error("[FeedCache] cachePost error:", error);
    }
  }

  /**
   * Get cached posts by IDs
   */
  async getCachedPosts(
    postIds: string[]
  ): Promise<Map<string, Partial<Post> | null>> {
    const result = new Map<string, Partial<Post> | null>();
    if (!this.redis || postIds.length === 0) return result;

    try {
      const pipeline = this.redis.pipeline();
      for (const postId of postIds) {
        pipeline.hgetall(`post:${postId}`);
      }
      const responses = await pipeline.exec();

      postIds.forEach((postId, idx) => {
        const data = responses?.[idx]?.[1] as Record<string, string> | null;
        if (data && Object.keys(data).length > 0) {
          result.set(postId, {
            id: data.id,
            authorId: data.authorId,
            content: data.content,
            media: data.media ? JSON.parse(data.media) : [],
            visibility: data.visibility as any,
            likeCount: parseInt(data.likeCount, 10),
            commentCount: parseInt(data.commentCount, 10),
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
            author: {
              id: data["author.id"],
              name: data["author.name"],
              image: data["author.image"] || null,
            } as any,
          });
        } else {
          result.set(postId, null);
        }
      });

      return result;
    } catch (error) {
      console.error("[FeedCache] getCachedPosts error:", error);
      return result;
    }
  }

  /**
   * Invalidate cached post
   */
  async invalidatePost(postId: string): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.del(`post:${postId}`);
    } catch (error) {
      console.error("[FeedCache] invalidatePost error:", error);
    }
  }

  // ============================================
  // Connection Cache Operations
  // ============================================

  /**
   * Get cached connection IDs for a user
   */
  async getConnectionIds(userId: string): Promise<string[] | null> {
    if (!this.redis) return null;

    try {
      const members = await this.redis.smembers(`connections:${userId}`);
      return members.length > 0 ? members : null;
    } catch (error) {
      console.error("[FeedCache] getConnectionIds error:", error);
      return null;
    }
  }

  /**
   * Cache connection IDs for a user
   */
  async cacheConnectionIds(userId: string, ids: string[]): Promise<void> {
    if (!this.redis || ids.length === 0) return;

    try {
      const key = `connections:${userId}`;
      await this.redis.sadd(key, ...ids);
      await this.redis.expire(key, CONNECTION_CACHE_TTL);
    } catch (error) {
      console.error("[FeedCache] cacheConnectionIds error:", error);
    }
  }

  /**
   * Invalidate connection cache for a user
   */
  async invalidateConnectionIds(userId: string): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.del(`connections:${userId}`);
    } catch (error) {
      console.error("[FeedCache] invalidateConnectionIds error:", error);
    }
  }

  /**
   * Get connection count (for celebrity threshold check)
   */
  async getConnectionCount(userId: string): Promise<number | null> {
    if (!this.redis) return null;

    try {
      const count = await this.redis.scard(`connections:${userId}`);
      return count;
    } catch (error) {
      console.error("[FeedCache] getConnectionCount error:", error);
      return null;
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.redis !== null;
  }
}
