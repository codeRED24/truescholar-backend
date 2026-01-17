import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { FeedCacheService, CELEBRITY_THRESHOLD } from "./feed-cache.service";
import { FollowersService } from "../followers/followers.service";
import {
  POST_EVENTS,
  PostCreatedEvent,
  PostUpdatedEvent,
  PostDeletedEvent,
  ENGAGEMENT_EVENTS,
  PostLikedEvent,
  PostUnlikedEvent,
  SOCIAL_GRAPH_EVENTS,
  UserFollowedEvent,
  UserUnfollowedEvent,
  COMMENT_EVENTS,
  CommentCreatedEvent,
  CommentDeletedEvent,
} from "../shared/events";

/**
 * Kafka Event Controller for handling feed fanout events.
 * Uses follow-based model (Twitter-style)
 *
 * This controller is the ONLY place where feed cache is updated.
 * Other modules emit events, this module handles cache side effects.
 */
@Controller()
export class FeedEventController {
  constructor(
    private readonly feedCache: FeedCacheService,
    private readonly followersService: FollowersService
  ) {}

  // ===========================================================================
  // Post Events
  // ===========================================================================

  @EventPattern(POST_EVENTS.CREATED)
  async handlePostCreated(@Payload() event: PostCreatedEvent) {
    const { postId, authorId, visibility } = event.payload;

    if (visibility === "private") {
      console.log(`[FeedFanout] Skipping private post ${postId}`);
      return;
    }

    const timestamp = Date.now();

    try {
      const followerIds = await this.getFollowerIds(authorId);
      const followerCount = followerIds.length;

      if (followerCount >= CELEBRITY_THRESHOLD) {
        await this.feedCache.addToCelebrityPosts(authorId, postId, timestamp);
        console.log(
          `[FeedFanout] Celebrity fan-out: added to outbox for ${authorId}`
        );
      } else {
        await this.feedCache.addToTimelines(followerIds, postId, timestamp);
        console.log(
          `[FeedFanout] Fan-out to ${followerCount} followers for post ${postId}`
        );
      }

      await this.feedCache.addToTimeline(authorId, postId, timestamp);
    } catch (error) {
      console.error(`[FeedFanout] Error fanning out post ${postId}:`, error);
    }
  }

  @EventPattern(POST_EVENTS.UPDATED)
  async handlePostUpdated(@Payload() event: PostUpdatedEvent) {
    const { postId, changedFields } = event.payload;

    try {
      // Invalidate cached post data so next fetch gets fresh content
      await this.feedCache.invalidatePost(postId);
      console.log(
        `[FeedFanout] Post ${postId} updated, fields: ${changedFields.join(", ")}`
      );
    } catch (error) {
      console.error(
        `[FeedFanout] Error invalidating updated post ${postId}:`,
        error
      );
    }
  }

  @EventPattern(POST_EVENTS.DELETED)
  async handlePostDeleted(@Payload() event: PostDeletedEvent) {
    const { postId, authorId } = event.payload;

    try {
      const followerIds = await this.getFollowerIds(authorId);
      await this.feedCache.removeFromTimelines(followerIds, postId);
      await this.feedCache.removeFromTimeline(authorId, postId);
      await this.feedCache.removeFromCelebrityPosts(authorId, postId);
      await this.feedCache.invalidatePost(postId);
      console.log(`[FeedFanout] Removed deleted post ${postId} from timelines`);
    } catch (error) {
      console.error(
        `[FeedFanout] Error removing deleted post ${postId}:`,
        error
      );
    }
  }

  // ===========================================================================
  // Engagement Events (Likes)
  // ===========================================================================

  @EventPattern(ENGAGEMENT_EVENTS.POST_LIKED)
  async handlePostLiked(@Payload() event: PostLikedEvent) {
    const { postId, likeCount } = event.payload;

    try {
      // Update cached post with new like count
      await this.feedCache.updatePostLikeCount(postId, likeCount);
      console.log(`[FeedFanout] Post ${postId} liked, count: ${likeCount}`);
    } catch (error) {
      console.error(
        `[FeedFanout] Error updating like count for ${postId}:`,
        error
      );
    }
  }

  @EventPattern(ENGAGEMENT_EVENTS.POST_UNLIKED)
  async handlePostUnliked(@Payload() event: PostUnlikedEvent) {
    const { postId, likeCount } = event.payload;

    try {
      await this.feedCache.updatePostLikeCount(postId, likeCount);
      console.log(`[FeedFanout] Post ${postId} unliked, count: ${likeCount}`);
    } catch (error) {
      console.error(
        `[FeedFanout] Error updating like count for ${postId}:`,
        error
      );
    }
  }

  // ===========================================================================
  // Comment Events
  // ===========================================================================

  @EventPattern(COMMENT_EVENTS.CREATED)
  async handleCommentCreated(@Payload() event: CommentCreatedEvent) {
    const { postId, postCommentCount } = event.payload;

    try {
      await this.feedCache.updatePostCommentCount(postId, postCommentCount);
      console.log(
        `[FeedFanout] Comment added to post ${postId}, count: ${postCommentCount}`
      );
    } catch (error) {
      console.error(
        `[FeedFanout] Error updating comment count for ${postId}:`,
        error
      );
    }
  }

  @EventPattern(COMMENT_EVENTS.DELETED)
  async handleCommentDeleted(@Payload() event: CommentDeletedEvent) {
    const { postId, postCommentCount } = event.payload;

    try {
      await this.feedCache.updatePostCommentCount(postId, postCommentCount);
      console.log(
        `[FeedFanout] Comment deleted from post ${postId}, count: ${postCommentCount}`
      );
    } catch (error) {
      console.error(
        `[FeedFanout] Error updating comment count for ${postId}:`,
        error
      );
    }
  }

  // ===========================================================================
  // Social Graph Events (Follows)
  // ===========================================================================

  @EventPattern(SOCIAL_GRAPH_EVENTS.USER_FOLLOWED)
  async handleUserFollowed(@Payload() event: UserFollowedEvent) {
    const { followerId, followingId } = event.payload;

    try {
      // Invalidate follower's connection cache so their feed gets rebuilt
      await this.feedCache.invalidateConnectionIds(followerId);
      console.log(
        `[FeedFanout] Follow created: ${followerId} -> ${followingId}`
      );
    } catch (error) {
      console.error("[FeedFanout] Error handling follow created:", error);
    }
  }

  @EventPattern(SOCIAL_GRAPH_EVENTS.USER_UNFOLLOWED)
  async handleUserUnfollowed(@Payload() event: UserUnfollowedEvent) {
    const { followerId, followingId } = event.payload;

    try {
      await this.feedCache.invalidateConnectionIds(followerId);
      console.log(
        `[FeedFanout] Follow removed: ${followerId} -> ${followingId}`
      );
    } catch (error) {
      console.error("[FeedFanout] Error handling follow removed:", error);
    }
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  private async getFollowerIds(userId: string): Promise<string[]> {
    const cached = await this.feedCache.getConnectionIds(userId);
    if (cached) return cached;

    // Get followers (people who follow this user)
    const followers = await this.followersService.getFollowers(
      userId,
      1,
      10000
    );
    const ids = followers.map((f) => f.user.id);
    await this.feedCache.cacheConnectionIds(userId, ids);
    return ids;
  }
}
