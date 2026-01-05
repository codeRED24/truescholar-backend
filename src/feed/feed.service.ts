import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Post } from "../posts/post.entity";
import { FeedCacheService } from "./feed-cache.service";
import { TrendingService } from "./trending.service";
import { ConnectionsService } from "../connections/connections.service";
import { LikesService } from "../likes/likes.service";
import { FeedPostDto, FeedResponseDto } from "./dto";

// Feed blend ratios for logged-in users
const CONNECTION_RATIO = 0.7; // 70%
const TRENDING_RATIO = 0.25; // 25%
// PROMOTED_RATIO = 0.05; // 5% - future

// Interleaving pattern: positions reserved for trending
const TRENDING_POSITIONS = [4, 8, 12, 16, 20]; // Every 4th after position 3
// const PROMOTED_POSITIONS = [9, 19, 29]; // Future

interface ScoredPost {
  postId: string;
  score: number;
  source: "connection" | "trending" | "promoted";
  timestamp: number;
}

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly feedCache: FeedCacheService,
    private readonly trendingService: TrendingService,
    private readonly connectionsService: ConnectionsService,
    private readonly likesService: LikesService
  ) {}

  /**
   * Get feed for authenticated user (blended algorithm)
   */
  async getFeed(
    userId: string,
    cursor: string | undefined,
    limit: number
  ): Promise<FeedResponseDto> {
    // 1. Get connection posts from pregenerated timeline
    const connectionPosts = await this.getConnectionPosts(
      userId,
      cursor,
      limit * 2
    );

    // 2. Get trending posts for discovery
    const trendingPosts = await this.getTrendingForBlend(cursor, limit);

    // 3. Get celebrity posts (fan-out on read)
    const celebrityPosts = await this.getCelebrityPosts(userId, cursor, limit);

    // 4. Combine and dedupe
    const allPosts = this.mergeAndDedupe([
      ...connectionPosts,
      ...celebrityPosts.map((p) => ({ ...p, source: "connection" as const })),
      ...trendingPosts,
    ]);

    // 5. Interleave based on pattern
    const interleaved = this.interleave(allPosts, limit);

    // 6. Hydrate with full post data
    const postIds = interleaved.map((p) => p.postId);
    const hydratedPosts = await this.hydratePosts(postIds);

    // 7. Get like status for user
    const likeStatuses = await this.likesService.getLikeStatusForPosts(
      userId,
      postIds
    );

    // 8. Map to response DTOs
    const posts = this.mapToResponse(hydratedPosts, likeStatuses);

    // 9. Calculate next cursor
    const nextCursor =
      posts.length >= limit
        ? interleaved[interleaved.length - 1]?.timestamp?.toString() || null
        : null;

    return { posts, nextCursor };
  }

  /**
   * Get feed for guest user (trending only)
   */
  async getGuestFeed(
    cursor: string | undefined,
    limit: number
  ): Promise<FeedResponseDto> {
    // Get guest feed from trending cache
    const { postIds, scores } = await this.trendingService.getGuestFeed(
      cursor,
      limit + 1
    );

    const hasMore = postIds.length > limit;
    const resultIds = postIds.slice(0, limit);

    // Hydrate posts
    const hydratedPosts = await this.hydratePosts(resultIds);

    // Map to response (no like status for guests)
    const posts = this.mapToResponse(hydratedPosts, new Map());

    // Next cursor is the score of last item
    const nextCursor = hasMore ? scores[limit - 1]?.toString() || null : null;

    return { posts, nextCursor };
  }

  /**
   * Get connection posts from pregenerated timeline
   */
  private async getConnectionPosts(
    userId: string,
    cursor: string | undefined,
    limit: number
  ): Promise<ScoredPost[]> {
    const timeline = await this.feedCache.getTimeline(userId, cursor, limit);

    if (!timeline || timeline.postIds.length === 0) {
      // Cache miss - rebuild from DB
      return await this.rebuildTimeline(userId, cursor, limit);
    }

    return timeline.postIds.map((postId, idx) => ({
      postId,
      score: this.calculateScore(timeline.scores[idx], "connection"),
      source: "connection" as const,
      timestamp: timeline.scores[idx],
    }));
  }

  /**
   * Rebuild timeline from database (fallback for cache miss)
   */
  private async rebuildTimeline(
    userId: string,
    cursor: string | undefined,
    limit: number
  ): Promise<ScoredPost[]> {
    // Get connection IDs
    const connectionIds = await this.getConnectionIds(userId);
    const allAuthorIds = [userId, ...connectionIds];

    if (allAuthorIds.length === 0) {
      return [];
    }

    // Query database
    const query = this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .where("post.isDeleted = false")
      .andWhere("post.authorId IN (:...authorIds)", { authorIds: allAuthorIds })
      .andWhere("post.visibility IN (:...visibilities)", {
        visibilities: ["public", "connections"],
      });

    if (cursor) {
      query.andWhere("post.createdAt < :cursor", {
        cursor: new Date(parseInt(cursor, 10)),
      });
    }

    const posts = await query
      .orderBy("post.createdAt", "DESC")
      .take(limit)
      .getMany();

    // Cache the results for next time
    for (const post of posts) {
      await this.feedCache.addToTimeline(
        userId,
        post.id,
        post.createdAt.getTime()
      );
      await this.feedCache.cachePost(post);
    }

    return posts.map((post) => ({
      postId: post.id,
      score: this.calculateScore(post.createdAt.getTime(), "connection"),
      source: "connection" as const,
      timestamp: post.createdAt.getTime(),
    }));
  }

  /**
   * Get trending posts for blending
   */
  private async getTrendingForBlend(
    cursor: string | undefined,
    limit: number
  ): Promise<ScoredPost[]> {
    const needed = Math.ceil(limit * TRENDING_RATIO);
    const { postIds, scores } = await this.trendingService.getTrendingPosts(
      cursor,
      needed * 2
    );

    return postIds.map((postId, idx) => ({
      postId,
      score: this.calculateScore(
        Date.now() - idx * 1000,
        "trending",
        scores[idx]
      ),
      source: "trending" as const,
      timestamp: Date.now() - idx * 1000,
    }));
  }

  /**
   * Get celebrity posts (fan-out on read)
   */
  private async getCelebrityPosts(
    userId: string,
    cursor: string | undefined,
    limit: number
  ): Promise<ScoredPost[]> {
    const connectionIds = await this.getConnectionIds(userId);
    const celebrityIds = await this.feedCache.filterCelebrities(connectionIds);

    if (celebrityIds.length === 0) {
      return [];
    }

    const posts = await this.feedCache.getCelebrityPosts(
      celebrityIds,
      cursor,
      10
    );

    return posts.map((p) => ({
      postId: p.postId,
      score: this.calculateScore(p.score, "connection"),
      source: "connection" as const,
      timestamp: p.score,
    }));
  }

  /**
   * Calculate composite score for ranking
   */
  private calculateScore(
    timestamp: number,
    source: "connection" | "trending" | "promoted",
    engagementScore?: number
  ): number {
    // Base score by source
    const baseScore =
      source === "connection" ? 1.0 : source === "trending" ? 0.6 : 0.8;

    // Recency decay: e^(-λ * hoursOld), λ = 0.02
    const hoursOld = (Date.now() - timestamp) / (1000 * 60 * 60);
    const recencyDecay = Math.exp(-0.02 * hoursOld);

    // Engagement boost
    const engagementBoost = engagementScore
      ? 1 + Math.log10(engagementScore + 1)
      : 1;

    return baseScore * recencyDecay * engagementBoost;
  }

  /**
   * Merge and deduplicate posts from different sources
   */
  private mergeAndDedupe(posts: ScoredPost[]): ScoredPost[] {
    const seen = new Set<string>();
    const result: ScoredPost[] = [];

    // Sort by score descending
    posts.sort((a, b) => b.score - a.score);

    for (const post of posts) {
      if (!seen.has(post.postId)) {
        seen.add(post.postId);
        result.push(post);
      }
    }

    return result;
  }

  /**
   * Interleave posts to ensure variety
   */
  private interleave(posts: ScoredPost[], limit: number): ScoredPost[] {
    const connectionPosts = posts.filter((p) => p.source === "connection");
    const trendingPosts = posts.filter((p) => p.source === "trending");

    const result: ScoredPost[] = [];
    let connIdx = 0;
    let trendIdx = 0;

    for (let pos = 1; pos <= limit && result.length < limit; pos++) {
      if (TRENDING_POSITIONS.includes(pos) && trendIdx < trendingPosts.length) {
        // Insert trending at designated positions
        result.push(trendingPosts[trendIdx++]);
      } else if (connIdx < connectionPosts.length) {
        // Fill with connection posts
        result.push(connectionPosts[connIdx++]);
      } else if (trendIdx < trendingPosts.length) {
        // Fallback to trending if no more connection posts
        result.push(trendingPosts[trendIdx++]);
      }
    }

    return result;
  }

  /**
   * Hydrate post IDs with full data from cache or DB
   */
  private async hydratePosts(postIds: string[]): Promise<Post[]> {
    if (postIds.length === 0) return [];

    // Try cache first
    const cached = await this.feedCache.getCachedPosts(postIds);

    // Find cache misses
    const missingIds = postIds.filter((id) => !cached.get(id));

    // Fetch from DB
    let dbPosts: Post[] = [];
    if (missingIds.length > 0) {
      dbPosts = await this.postRepository.find({
        where: { id: In(missingIds), isDeleted: false },
        relations: ["author", "taggedCollege"],
      });

      // Cache for next time
      for (const post of dbPosts) {
        await this.feedCache.cachePost(post);
      }
    }

    // Merge cached and DB results, maintaining order
    const postMap = new Map<string, Post>();
    for (const post of dbPosts) {
      postMap.set(post.id, post);
    }
    for (const [id, post] of cached) {
      if (post) {
        postMap.set(id, post as Post);
      }
    }

    return postIds.map((id) => postMap.get(id)).filter(Boolean) as Post[];
  }

  /**
   * Map posts to response DTOs
   */
  private mapToResponse(
    posts: Post[],
    likeStatuses: Map<string, boolean>
  ): FeedPostDto[] {
    return posts.map((post) => ({
      id: post.id,
      content: post.content,
      media: post.media || [],
      visibility: post.visibility,
      authorType: post.authorType,
      type: post.type,
      taggedCollegeId: post.taggedCollegeId,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author
        ? {
            id: post.author.id,
            name: post.author.name,
            image: post.author.image,
            user_type: post.author.user_type,
          }
        : { id: post.authorId, name: "", image: undefined },
      hasLiked: likeStatuses.get(post.id) || false,
    }));
  }

  /**
   * Get connection IDs with caching
   */
  private async getConnectionIds(userId: string): Promise<string[]> {
    const cached = await this.feedCache.getConnectionIds(userId);
    if (cached) return cached;

    const ids = await this.connectionsService.getConnectionUserIds(userId);
    await this.feedCache.cacheConnectionIds(userId, ids);
    return ids;
  }

  /**
   * Warm cache for user (call on login)
   */
  async warmCache(userId: string): Promise<void> {
    // Pre-populate timeline on login
    await this.rebuildTimeline(userId, undefined, 50);
    console.log(`[Feed] Warmed cache for user ${userId}`);
  }
}
