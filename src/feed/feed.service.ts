import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Brackets } from "typeorm";
import { Post, PostVisibility } from "../posts/post.entity";
import { FeedCacheService } from "./feed-cache.service";
import { TrendingService } from "./trending.service";
import { LikesService } from "../likes/likes.service";
import { FollowersService } from "../followers/followers.service";
import { DiscoveryService } from "../followers/discovery.service";
import { AuthorType } from "../common/enums";
import { FeedPostDto, FeedResponseDto, FeedItemDto } from "./dto";

// Feed blend ratios for logged-in users
const FOLLOWING_RATIO = 0.7; // 70%
const TRENDING_RATIO = 0.25; // 25%
// PROMOTED_RATIO = 0.05; // 5% - future

// Interleaving pattern: positions reserved for trending
const TRENDING_POSITIONS = [4, 8, 12, 16, 20]; // Every 4th after position 3
// const PROMOTED_POSITIONS = [9, 19, 29]; // Future

// Positions for "Who to follow" suggestions (sparse: 3, 53, 103...)
const FIRST_SUGGESTION_POSITION = 3;
const SUGGESTION_INTERVAL = 50;

interface ScoredPost {
  postId: string;
  score: number;
  source: "following" | "trending" | "promoted";
  timestamp: number;
}

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly feedCache: FeedCacheService,
    private readonly trendingService: TrendingService,
    private readonly likesService: LikesService,
    private readonly followersService: FollowersService,
    private readonly discoveryService: DiscoveryService
  ) {}

  /**
   * Get feed for authenticated user (blended algorithm)
   */
  async getFeed(
    userId: string,
    cursor: string | undefined,
    limit: number,
    authorType?: string,
    collegeId?: number
  ): Promise<FeedResponseDto> {
    // 1. Get posts from followed users from pregenerated timeline
    const followingPosts = await this.getFollowingPosts(
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
      ...followingPosts,
      ...celebrityPosts.map((p) => ({ ...p, source: "following" as const })),
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
      postIds,
      authorType as AuthorType,
      collegeId
    );

    // 8. Get follow status for post authors
    const followingIds = await this.followersService.getFollowingIds(userId);
    const followingSet = new Set(followingIds);

    // 9. Map to response DTOs
    const postDtos = this.mapToResponse(
      hydratedPosts,
      likeStatuses,
      followingSet,
      userId
    );

    // 10. Get user suggestions for injection
    const suggestions = await this.discoveryService.getSuggestions(userId, 3);

    // 11. Build heterogeneous items array with suggestions injected
    const items = this.buildFeedItems(postDtos, suggestions);

    // 12. Calculate next cursor
    const nextCursor =
      postDtos.length >= limit
        ? interleaved[interleaved.length - 1]?.timestamp?.toString() || null
        : null;

    return { items, nextCursor };
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

    // Map to response (no like status or follow status for guests)
    const postDtos = this.mapToResponse(
      hydratedPosts,
      new Map(),
      new Set(),
      undefined
    );

    // Build items without suggestions for guest feed
    const items: FeedItemDto[] = postDtos.map((post) => ({
      type: "post" as const,
      post,
    }));

    // Next cursor is the score of last item
    const nextCursor = hasMore ? scores[limit - 1]?.toString() || null : null;

    return { items, nextCursor };
  }

  /**
   * Get posts from followed users from pregenerated timeline
   */
  private async getFollowingPosts(
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
      score: this.calculateScore(timeline.scores[idx], "following"),
      source: "following" as const,
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
    // Optimized scalable query using JOINs instead of fetching all IDs
    const query = this.postRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .leftJoinAndSelect("post.taggedCollege", "taggedCollege")
      // Join with user follows to check if current user follows the author
      .leftJoin(
        "follow",
        "f",
        "f.followingId = post.authorId AND f.followerId = :userId",
        { userId }
      )
      // Join with college follows to check if current user follows the college
      .leftJoin(
        "follow_college",
        "fc",
        "fc.collegeId = post.taggedCollegeId AND fc.followerId = :userId",
        { userId }
      )
      // Join with members to check membership
      .leftJoin(
        "member",
        "m",
        "m.collegeId = post.taggedCollegeId AND m.userId = :userId",
        { userId }
      )
      .where("post.isDeleted = false")
      .andWhere(
        new Brackets((qb) => {
          // 1. My own posts
          qb.where("post.authorId = :userId", { userId })
            // 2. Posts from users I follow (f.id is not null)
            .orWhere("f.id IS NOT NULL")
            // 3. Posts from colleges I follow (fc.id is not null)
            .orWhere(
              "fc.id IS NOT NULL AND post.authorType = :collegeType",
              { collegeType: "college" }
            );
        })
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where("post.visibility = :public", {
            public: PostVisibility.PUBLIC,
          })
            .orWhere("post.visibility = :connections", {
              connections: PostVisibility.CONNECTIONS,
            })
            .orWhere("post.visibility = :college AND m.id IS NOT NULL", {
              college: PostVisibility.COLLEGE,
            })
            // Author can always see their own posts
            .orWhere("post.authorId = :userId", { userId });
        })
      );

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
      score: this.calculateScore(post.createdAt.getTime(), "following"),
      source: "following" as const,
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
    const followingIds = await this.getFollowingIds(userId);
    const celebrityIds = await this.feedCache.filterCelebrities(followingIds);

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
      score: this.calculateScore(p.score, "following"),
      source: "following" as const,
      timestamp: p.score,
    }));
  }

  /**
   * Calculate composite score for ranking
   */
  private calculateScore(
    timestamp: number,
    source: "following" | "trending" | "promoted",
    engagementScore?: number
  ): number {
    // Base score by source
    const baseScore =
      source === "following" ? 1.0 : source === "trending" ? 0.6 : 0.8;

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
    const followingPosts = posts.filter((p) => p.source === "following");
    const trendingPosts = posts.filter((p) => p.source === "trending");

    const result: ScoredPost[] = [];
    let followIdx = 0;
    let trendIdx = 0;

    for (let pos = 1; pos <= limit && result.length < limit; pos++) {
      if (TRENDING_POSITIONS.includes(pos) && trendIdx < trendingPosts.length) {
        // Insert trending at designated positions
        result.push(trendingPosts[trendIdx++]);
      } else if (followIdx < followingPosts.length) {
        // Fill with following posts
        result.push(followingPosts[followIdx++]);
      } else if (trendIdx < trendingPosts.length) {
        // Fallback to trending if no more following posts
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
    likeStatuses: Map<string, boolean>,
    followingSet: Set<string>,
    currentUserId: string | undefined
  ): FeedPostDto[] {
    return posts.map((post) => {
      const authorId = post.author?.id || post.authorId;
      // User doesn't follow themselves, and can't follow if not logged in
      const isFollowing =
        currentUserId && authorId !== currentUserId
          ? followingSet.has(authorId)
          : false;

      return {
        id: post.id,
        content: post.content,
        media: post.media || [],
        visibility: post.visibility,
        authorType: post.authorType,
        type: post.type,
        taggedCollegeId: post.taggedCollegeId,
        taggedCollege: post.taggedCollege
          ? {
              college_id: post.taggedCollege.college_id,
              college_name: post.taggedCollege.college_name,
              logo_img: post.taggedCollege.logo_img,
              slug: post.taggedCollege.slug,
            }
          : undefined,
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
        isFollowing,
      };
    });
  }

  /**
   * Get following IDs with caching
   */
  private async getFollowingIds(userId: string): Promise<string[]> {
    const cached = await this.feedCache.getConnectionIds(userId);
    if (cached) return cached;

    const ids = await this.followersService.getFollowingIds(userId);
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

  /**
   * Build heterogeneous feed items with suggestions injected at specific positions
   * Pattern: inject at position 3, then every 50 posts (3, 53, 103...)
   */
  private buildFeedItems(
    posts: FeedPostDto[],
    suggestions: Array<{
      id: string;
      name: string;
      image: string | null;
      mutualCount: number;
    }>
  ): FeedItemDto[] {
    const items: FeedItemDto[] = [];
    let suggestionInjected = false;

    for (let i = 0; i < posts.length; i++) {
      // Check if we should inject suggestions at this position
      const shouldInject =
        suggestions.length > 0 &&
        (i === FIRST_SUGGESTION_POSITION ||
          (i > FIRST_SUGGESTION_POSITION &&
            (i - FIRST_SUGGESTION_POSITION) % SUGGESTION_INTERVAL === 0));

      if (shouldInject && !suggestionInjected) {
        // Inject suggestion card (only once per feed page to avoid duplication)
        items.push({
          type: "suggestions",
          suggestions: suggestions.map((s) => ({
            id: s.id,
            name: s.name,
            image: s.image ?? undefined,
            mutualCount: s.mutualCount,
          })),
        });
        suggestionInjected = true;
      }

      // Add the post
      items.push({ type: "post", post: posts[i] });
    }

    return items;
  }
}
