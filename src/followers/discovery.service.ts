import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Follow } from "./follow.entity";
import { FollowCacheService } from "./follow-cache.service";
import { FollowRepository } from "./follow.repository";

export interface SuggestedUser {
  id: string;
  name: string;
  image: string | null;
  headline?: string;
  mutualCount: number;
}

interface UserRow {
  id: string;
  name: string;
  image: string | null;
}

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    private readonly followCacheService: FollowCacheService,
    private readonly followRepository: FollowRepository
  ) {}

  /**
   * Get suggested users (Friends of Friends algorithm)
   * Uses Redis for fast lookups, falls back to DB on cache miss
   */
  async getSuggestions(userId: string, limit = 20): Promise<SuggestedUser[]> {
    // 1. Check Redis cache for pre-computed suggestions
    const cached = await this.followCacheService.getSuggestions(userId);
    if (cached && cached.length > 0) {
      return this.hydrateUsers(cached.slice(0, limit));
    }

    // 2. Try Redis-based computation
    let myFollowing = await this.followCacheService.getFollowing(userId);

    // 3. Cache miss - load from DB and cache
    if (!myFollowing) {
      const followingIds = await this.followRepository.getFollowingIds(userId);
      if (followingIds.length > 0) {
        await this.followCacheService.cacheFollowing(userId, followingIds);
        myFollowing = followingIds;
      } else {
        myFollowing = [];
      }
    }

    if (myFollowing.length === 0) {
      // No following - return popular users
      return this.getPopularUsers(userId, limit);
    }

    // 4. Friends of Friends: Get who my follows are following
    const candidates = new Map<string, number>();
    const myFollowingSet = new Set(myFollowing);

    // Limit to 100 to prevent explosion
    const sampleFollowing = myFollowing.slice(0, 100);

    for (const followedId of sampleFollowing) {
      let theirFollowing =
        await this.followCacheService.getFollowing(followedId);

      // Cache miss - load from DB
      if (!theirFollowing) {
        const ids = await this.followRepository.getFollowingIds(followedId);
        if (ids.length > 0) {
          await this.followCacheService.cacheFollowing(followedId, ids);
          theirFollowing = ids;
        } else {
          theirFollowing = [];
        }
      }

      for (const candidateId of theirFollowing) {
        // Skip self and already following
        if (candidateId !== userId && !myFollowingSet.has(candidateId)) {
          candidates.set(candidateId, (candidates.get(candidateId) || 0) + 1);
        }
      }
    }

    // 5. Sort by mutual count and take top N
    const sorted = [...candidates.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // 5b. Fallback to popular users if no friends-of-friends found
    if (sorted.length === 0) {
      return this.getPopularUsers(userId, limit, myFollowingSet);
    }

    const suggestedIds = sorted.map(([id]) => id);

    // 6. Cache the results
    if (suggestedIds.length > 0) {
      await this.followCacheService.cacheSuggestions(userId, suggestedIds);
    }

    // 7. Hydrate with user data including mutual count
    return this.hydrateUsersWithMutual(sorted);
  }

  /**
   * Hydrate user IDs with user data
   */
  private async hydrateUsers(userIds: string[]): Promise<SuggestedUser[]> {
    if (userIds.length === 0) return [];

    // Query user table directly
    const users = await this.followRepo.manager.query(
      `SELECT id, name, image FROM "user" WHERE id = ANY($1)`,
      [userIds]
    );

    const userMap = new Map<string, UserRow>(
      users.map((u: UserRow) => [u.id, u])
    );

    return userIds
      .map((id) => {
        const user = userMap.get(id);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          image: user.image,
          mutualCount: 0,
        };
      })
      .filter((u): u is SuggestedUser => u !== null);
  }

  /**
   * Hydrate with mutual count preserved
   */
  private async hydrateUsersWithMutual(
    sorted: [string, number][]
  ): Promise<SuggestedUser[]> {
    if (sorted.length === 0) return [];

    const userIds = sorted.map(([id]) => id);
    const mutualMap = new Map(sorted);

    const users = await this.followRepo.manager.query(
      `SELECT id, name, image FROM "user" WHERE id = ANY($1)`,
      [userIds]
    );

    const userMap = new Map<string, UserRow>(
      users.map((u: UserRow) => [u.id, u])
    );

    return userIds
      .map((id) => {
        const user = userMap.get(id);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name,
          image: user.image,
          mutualCount: mutualMap.get(id) || 0,
        };
      })
      .filter((u): u is SuggestedUser => u !== null);
  }

  /**
   * Fallback: Get popular users (users with most followers)
   * Excludes the current user and optionally users they already follow
   */
  private async getPopularUsers(
    excludeUserId: string,
    limit: number,
    excludeFollowing?: Set<string>
  ): Promise<SuggestedUser[]> {
    const results = await this.followRepo.manager.query(
      `
      SELECT u.id, u.name, u.image, COUNT(f.id) as follower_count
      FROM "user" u
      LEFT JOIN follow f ON f."followingId" = u.id
      WHERE u.id != $1
      GROUP BY u.id
      ORDER BY follower_count DESC
      LIMIT $2
      `,
      [excludeUserId, limit + (excludeFollowing?.size || 0) + 10] // Fetch extra to account for filtering
    );

    return results
      .filter((r: any) => !excludeFollowing || !excludeFollowing.has(r.id))
      .slice(0, limit)
      .map((r: any) => ({
        id: r.id,
        name: r.name,
        image: r.image,
        mutualCount: 0,
      }));
  }
}
