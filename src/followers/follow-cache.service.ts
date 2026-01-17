import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

// TTLs in seconds
const FOLLOW_CACHE_TTL = 24 * 60 * 60; // 24 hours
const SUGGESTIONS_TTL = 6 * 60 * 60; // 6 hours

@Injectable()
export class FollowCacheService {
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
        console.error("[FollowCache] Redis error:", err.message);
      });
    } catch (error) {
      console.error("[FollowCache] Failed to connect to Redis:", error);
      this.redis = null;
    }
  }

  // ============================================
  // Follow Graph Operations (Redis Sets)
  // ============================================

  /**
   * Add to following set (write-through on follow)
   */
  async addFollow(followerId: string, followingId: string): Promise<void> {
    if (!this.redis) return;

    try {
      const pipeline = this.redis.pipeline();
      pipeline.sadd(`following:${followerId}`, followingId);
      pipeline.sadd(`followers:${followingId}`, followerId);
      pipeline.expire(`following:${followerId}`, FOLLOW_CACHE_TTL);
      pipeline.expire(`followers:${followingId}`, FOLLOW_CACHE_TTL);
      // Invalidate cached suggestions for both users
      pipeline.del(`suggestions:${followerId}`);
      pipeline.del(`suggestions:${followingId}`);
      await pipeline.exec();
    } catch (error) {
      console.error("[FollowCache] addFollow error:", error);
    }
  }

  /**
   * Remove from following set (write-through on unfollow)
   */
  async removeFollow(followerId: string, followingId: string): Promise<void> {
    if (!this.redis) return;

    try {
      const pipeline = this.redis.pipeline();
      pipeline.srem(`following:${followerId}`, followingId);
      pipeline.srem(`followers:${followingId}`, followerId);
      // Invalidate cached suggestions
      pipeline.del(`suggestions:${followerId}`);
      pipeline.del(`suggestions:${followingId}`);
      await pipeline.exec();
    } catch (error) {
      console.error("[FollowCache] removeFollow error:", error);
    }
  }

  /**
   * Get all users that userId follows (from cache)
   */
  async getFollowing(userId: string): Promise<string[] | null> {
    if (!this.redis) return null;

    try {
      const members = await this.redis.smembers(`following:${userId}`);
      return members.length > 0 ? members : null;
    } catch (error) {
      console.error("[FollowCache] getFollowing error:", error);
      return null;
    }
  }

  /**
   * Get all followers of userId (from cache)
   */
  async getFollowers(userId: string): Promise<string[] | null> {
    if (!this.redis) return null;

    try {
      const members = await this.redis.smembers(`followers:${userId}`);
      return members.length > 0 ? members : null;
    } catch (error) {
      console.error("[FollowCache] getFollowers error:", error);
      return null;
    }
  }

  /**
   * Cache following list from DB (on cache miss)
   */
  async cacheFollowing(userId: string, followingIds: string[]): Promise<void> {
    if (!this.redis || followingIds.length === 0) return;

    try {
      const key = `following:${userId}`;
      await this.redis.del(key);
      await this.redis.sadd(key, ...followingIds);
      await this.redis.expire(key, FOLLOW_CACHE_TTL);
    } catch (error) {
      console.error("[FollowCache] cacheFollowing error:", error);
    }
  }

  /**
   * Cache followers list from DB (on cache miss)
   */
  async cacheFollowers(userId: string, followerIds: string[]): Promise<void> {
    if (!this.redis || followerIds.length === 0) return;

    try {
      const key = `followers:${userId}`;
      await this.redis.del(key);
      await this.redis.sadd(key, ...followerIds);
      await this.redis.expire(key, FOLLOW_CACHE_TTL);
    } catch (error) {
      console.error("[FollowCache] cacheFollowers error:", error);
    }
  }

  /**
   * Check if user A follows user B (fast lookup)
   */
  async isFollowing(
    followerId: string,
    followingId: string
  ): Promise<boolean | null> {
    if (!this.redis) return null;

    try {
      const result = await this.redis.sismember(
        `following:${followerId}`,
        followingId
      );
      return result === 1;
    } catch (error) {
      console.error("[FollowCache] isFollowing error:", error);
      return null;
    }
  }

  /**
   * Get mutual follows between two users
   */
  async getMutualFollowing(
    userA: string,
    userB: string
  ): Promise<string[] | null> {
    if (!this.redis) return null;

    try {
      return await this.redis.sinter(
        `following:${userA}`,
        `following:${userB}`
      );
    } catch (error) {
      console.error("[FollowCache] getMutualFollowing error:", error);
      return null;
    }
  }

  // ============================================
  // Suggestions Cache
  // ============================================

  /**
   * Get cached suggestions
   */
  async getSuggestions(userId: string): Promise<string[] | null> {
    if (!this.redis) return null;

    try {
      const suggestions = await this.redis.lrange(
        `suggestions:${userId}`,
        0,
        19
      );
      return suggestions.length > 0 ? suggestions : null;
    } catch (error) {
      console.error("[FollowCache] getSuggestions error:", error);
      return null;
    }
  }

  /**
   * Cache suggestions
   */
  async cacheSuggestions(userId: string, userIds: string[]): Promise<void> {
    if (!this.redis || userIds.length === 0) return;

    try {
      const key = `suggestions:${userId}`;
      await this.redis.del(key);
      await this.redis.rpush(key, ...userIds);
      await this.redis.expire(key, SUGGESTIONS_TTL);
    } catch (error) {
      console.error("[FollowCache] cacheSuggestions error:", error);
    }
  }

  /**
   * Invalidate suggestions for a user
   */
  async invalidateSuggestions(userId: string): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.del(`suggestions:${userId}`);
    } catch (error) {
      console.error("[FollowCache] invalidateSuggestions error:", error);
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.redis !== null;
  }
}
