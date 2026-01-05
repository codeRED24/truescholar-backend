import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import Redis from "ioredis";
import { Post } from "../posts/post.entity";

const TRENDING_TTL = 5 * 60; // 5 minutes
const TRENDING_MAX_SIZE = 200;
const GUEST_FEED_MAX_SIZE = 100;

interface TrendingPost {
  postId: string;
  score: number;
}

@Injectable()
export class TrendingService {
  private redis: Redis | null = null;

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 100, 3000);
        },
      });
    } catch (error) {
      console.error("[Trending] Failed to connect to Redis:", error);
    }
  }

  /**
   * Calculate trending score for a post
   * Higher engagement velocity = higher score
   */
  calculateTrendingScore(
    likes: number,
    comments: number,
    createdAt: Date
  ): number {
    const hoursOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    const engagement = likes + comments * 2;
    // Quadratic decay: recent posts with high engagement win
    return engagement / Math.pow(hoursOld + 1, 2);
  }

  /**
   * Refresh trending posts cache
   * Called every 5 minutes by cron job
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async refreshTrendingPosts(): Promise<void> {
    if (!this.redis) return;

    try {
      console.log("[Trending] Refreshing trending posts...");

      // Fetch recent public posts (last 48 hours)
      const recentPosts = await this.postRepository.find({
        where: {
          isDeleted: false,
          visibility: "public" as any,
          createdAt: MoreThan(new Date(Date.now() - 48 * 60 * 60 * 1000)),
        },
        select: ["id", "likeCount", "commentCount", "createdAt"],
        order: { createdAt: "DESC" },
        take: 1000,
      });

      // Calculate trending scores
      const scoredPosts: TrendingPost[] = recentPosts.map((post) => ({
        postId: post.id,
        score: this.calculateTrendingScore(
          post.likeCount,
          post.commentCount,
          post.createdAt
        ),
      }));

      // Sort by score and take top N
      scoredPosts.sort((a, b) => b.score - a.score);
      const topTrending = scoredPosts.slice(0, TRENDING_MAX_SIZE);

      if (topTrending.length === 0) {
        console.log("[Trending] No posts to cache");
        return;
      }

      // Update Redis sorted set
      const pipeline = this.redis.pipeline();
      pipeline.del("trending_posts");

      for (const post of topTrending) {
        pipeline.zadd("trending_posts", post.score, post.postId);
      }

      pipeline.expire("trending_posts", TRENDING_TTL);
      await pipeline.exec();

      console.log(`[Trending] Cached ${topTrending.length} trending posts`);

      // Also update guest feed
      await this.refreshGuestFeed(topTrending);
    } catch (error) {
      console.error("[Trending] Failed to refresh:", error);
    }
  }

  /**
   * Refresh guest feed (subset of trending for unauthenticated users)
   */
  private async refreshGuestFeed(trendingPosts: TrendingPost[]): Promise<void> {
    if (!this.redis) return;

    try {
      const guestPosts = trendingPosts.slice(0, GUEST_FEED_MAX_SIZE);

      const pipeline = this.redis.pipeline();
      pipeline.del("guest_feed");

      for (const post of guestPosts) {
        pipeline.zadd("guest_feed", post.score, post.postId);
      }

      pipeline.expire("guest_feed", TRENDING_TTL);
      await pipeline.exec();

      console.log(`[Trending] Cached ${guestPosts.length} guest feed posts`);
    } catch (error) {
      console.error("[Trending] Failed to refresh guest feed:", error);
    }
  }

  /**
   * Get trending post IDs with cursor pagination
   */
  async getTrendingPosts(
    cursor: string | undefined,
    limit: number
  ): Promise<{ postIds: string[]; scores: number[] }> {
    if (!this.redis) {
      return { postIds: [], scores: [] };
    }

    try {
      const maxScore = cursor ? parseFloat(cursor) - 0.0001 : "+inf";
      const results = await this.redis.zrevrangebyscore(
        "trending_posts",
        maxScore,
        "-inf",
        "WITHSCORES",
        "LIMIT",
        0,
        limit + 1
      );

      const postIds: string[] = [];
      const scores: number[] = [];

      for (let i = 0; i < results.length; i += 2) {
        postIds.push(results[i]);
        scores.push(parseFloat(results[i + 1]));
      }

      return { postIds, scores };
    } catch (error) {
      console.error("[Trending] getTrendingPosts error:", error);
      return { postIds: [], scores: [] };
    }
  }

  /**
   * Get guest feed post IDs
   */
  async getGuestFeed(
    cursor: string | undefined,
    limit: number
  ): Promise<{ postIds: string[]; scores: number[] }> {
    if (!this.redis) {
      return { postIds: [], scores: [] };
    }

    try {
      const maxScore = cursor ? parseFloat(cursor) - 0.0001 : "+inf";
      const results = await this.redis.zrevrangebyscore(
        "guest_feed",
        maxScore,
        "-inf",
        "WITHSCORES",
        "LIMIT",
        0,
        limit + 1
      );

      const postIds: string[] = [];
      const scores: number[] = [];

      for (let i = 0; i < results.length; i += 2) {
        postIds.push(results[i]);
        scores.push(parseFloat(results[i + 1]));
      }

      return { postIds, scores };
    } catch (error) {
      console.error("[Trending] getGuestFeed error:", error);
      return { postIds: [], scores: [] };
    }
  }

  /**
   * Force refresh on startup
   */
  async onModuleInit(): Promise<void> {
    // Initial refresh after 10 seconds (let other services initialize)
    setTimeout(() => {
      this.refreshTrendingPosts();
    }, 10000);
  }
}
