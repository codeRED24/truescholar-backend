import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { FeedCacheService, CELEBRITY_THRESHOLD } from "./feed-cache.service";
import { ConnectionsService } from "../connections/connections.service";

/**
 * Kafka Event Controller for handling feed fanout events.
 * Replaces the event subscription logic from feed-fanout.service.ts
 */
@Controller()
export class FeedEventController {
  constructor(
    private readonly feedCache: FeedCacheService,
    private readonly connectionsService: ConnectionsService
  ) {}

  @EventPattern("post.created")
  async handlePostCreated(
    @Payload()
    event: {
      payload: { postId: string; authorId: string; visibility: string };
    }
  ) {
    const { postId, authorId, visibility } = event.payload;

    if (visibility === "private") {
      console.log(`[FeedFanout] Skipping private post ${postId}`);
      return;
    }

    const timestamp = Date.now();

    try {
      const connectionIds = await this.getConnectionIds(authorId);
      const connectionCount = connectionIds.length;

      if (connectionCount >= CELEBRITY_THRESHOLD) {
        await this.feedCache.addToCelebrityPosts(authorId, postId, timestamp);
        console.log(
          `[FeedFanout] Celebrity fan-out: added to outbox for ${authorId}`
        );
      } else {
        await this.feedCache.addToTimelines(connectionIds, postId, timestamp);
        console.log(
          `[FeedFanout] Fan-out to ${connectionCount} connections for post ${postId}`
        );
      }

      await this.feedCache.addToTimeline(authorId, postId, timestamp);
    } catch (error) {
      console.error(`[FeedFanout] Error fanning out post ${postId}:`, error);
    }
  }

  @EventPattern("post.deleted")
  async handlePostDeleted(
    @Payload() event: { payload: { postId: string; authorId: string } }
  ) {
    const { postId, authorId } = event.payload;

    try {
      const connectionIds = await this.getConnectionIds(authorId);
      await this.feedCache.removeFromTimelines(connectionIds, postId);
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

  @EventPattern("connections.accepted")
  async handleConnectionAccepted(
    @Payload() event: { payload: { requesterId: string; addresseeId: string } }
  ) {
    const { requesterId, addresseeId } = event.payload;

    try {
      await this.feedCache.invalidateConnectionIds(requesterId);
      await this.feedCache.invalidateConnectionIds(addresseeId);
      console.log(
        `[FeedFanout] Connection accepted: ${requesterId} <-> ${addresseeId}`
      );
    } catch (error) {
      console.error("[FeedFanout] Error handling connection accepted:", error);
    }
  }

  @EventPattern("connections.removed")
  async handleConnectionRemoved(
    @Payload() event: { payload: { userId1: string; userId2: string } }
  ) {
    const { userId1, userId2 } = event.payload;

    try {
      await this.feedCache.invalidateConnectionIds(userId1);
      await this.feedCache.invalidateConnectionIds(userId2);
      console.log(`[FeedFanout] Connection removed: ${userId1} <-> ${userId2}`);
    } catch (error) {
      console.error("[FeedFanout] Error handling connection removed:", error);
    }
  }

  private async getConnectionIds(userId: string): Promise<string[]> {
    const cached = await this.feedCache.getConnectionIds(userId);
    if (cached) return cached;

    const ids = await this.connectionsService.getConnectionUserIds(userId);
    await this.feedCache.cacheConnectionIds(userId, ids);
    return ids;
  }
}
