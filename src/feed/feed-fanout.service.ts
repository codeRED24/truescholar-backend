import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { IEventBus, EVENT_BUS } from "../shared/events";
import { FeedCacheService, CELEBRITY_THRESHOLD } from "./feed-cache.service";
import { ConnectionsService } from "../connections/connections.service";

@Injectable()
export class FeedFanoutService implements OnModuleInit {
  constructor(
    private readonly feedCache: FeedCacheService,
    private readonly connectionsService: ConnectionsService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  async onModuleInit() {
    // Subscribe to post events
    this.eventBus.subscribe("post.created", this.handlePostCreated.bind(this));
    this.eventBus.subscribe("post.deleted", this.handlePostDeleted.bind(this));
    this.eventBus.subscribe(
      "connections.accepted",
      this.handleConnectionAccepted.bind(this)
    );
    this.eventBus.subscribe(
      "connections.removed",
      this.handleConnectionRemoved.bind(this)
    );

    console.log("[FeedFanout] Subscribed to events");
  }

  /**
   * Fan out new post to follower timelines
   * Uses hybrid strategy: regular users get fan-out on write,
   * celebrities (1000+ connections) use fan-out on read
   */
  async handlePostCreated(event: {
    payload: {
      postId: string;
      authorId: string;
      visibility: string;
      content: string;
    };
  }): Promise<void> {
    const { postId, authorId, visibility } = event.payload;

    // Only fan-out public and connections-visible posts
    if (visibility === "private") {
      console.log(`[FeedFanout] Skipping private post ${postId}`);
      return;
    }

    const timestamp = Date.now();

    try {
      // Get connection count to determine strategy
      const connectionIds = await this.getConnectionIds(authorId);
      const connectionCount = connectionIds.length;

      if (connectionCount >= CELEBRITY_THRESHOLD) {
        // Celebrity: Store in author's outbox only (fan-out on read)
        await this.feedCache.addToCelebrityPosts(authorId, postId, timestamp);
        console.log(
          `[FeedFanout] Celebrity fan-out: added to outbox for ${authorId}`
        );
      } else {
        // Regular user: Fan-out to all connections
        await this.feedCache.addToTimelines(connectionIds, postId, timestamp);
        console.log(
          `[FeedFanout] Fan-out to ${connectionCount} connections for post ${postId}`
        );
      }

      // Always add to author's own timeline
      await this.feedCache.addToTimeline(authorId, postId, timestamp);
    } catch (error) {
      console.error(`[FeedFanout] Error fanning out post ${postId}:`, error);
    }
  }

  /**
   * Remove deleted post from all timelines
   */
  async handlePostDeleted(event: {
    payload: { postId: string; authorId: string };
  }): Promise<void> {
    const { postId, authorId } = event.payload;

    try {
      // Get all connections to remove from their timelines
      const connectionIds = await this.getConnectionIds(authorId);

      // Remove from all connection timelines
      await this.feedCache.removeFromTimelines(connectionIds, postId);

      // Remove from author's timeline
      await this.feedCache.removeFromTimeline(authorId, postId);

      // Remove from celebrity posts if applicable
      await this.feedCache.removeFromCelebrityPosts(authorId, postId);

      // Invalidate cached post data
      await this.feedCache.invalidatePost(postId);

      console.log(`[FeedFanout] Removed deleted post ${postId} from timelines`);
    } catch (error) {
      console.error(
        `[FeedFanout] Error removing deleted post ${postId}:`,
        error
      );
    }
  }

  /**
   * When a new connection is accepted, backfill recent posts
   * to both users' timelines
   */
  async handleConnectionAccepted(event: {
    payload: {
      connectionId: string;
      requesterId: string;
      addresseeId: string;
    };
  }): Promise<void> {
    const { requesterId, addresseeId } = event.payload;

    try {
      // Invalidate connection caches for both users
      await this.feedCache.invalidateConnectionIds(requesterId);
      await this.feedCache.invalidateConnectionIds(addresseeId);

      // TODO: Optionally backfill recent posts from each user to the other's timeline
      // This is optional because new posts will appear naturally going forward
      console.log(
        `[FeedFanout] Connection accepted: ${requesterId} <-> ${addresseeId}`
      );
    } catch (error) {
      console.error("[FeedFanout] Error handling connection accepted:", error);
    }
  }

  /**
   * When a connection is removed, clean up timelines
   */
  async handleConnectionRemoved(event: {
    payload: {
      connectionId: string;
      userId1: string;
      userId2: string;
    };
  }): Promise<void> {
    const { userId1, userId2 } = event.payload;

    try {
      // Invalidate connection caches for both users
      await this.feedCache.invalidateConnectionIds(userId1);
      await this.feedCache.invalidateConnectionIds(userId2);

      // Note: We don't remove existing posts from timelines
      // They'll naturally age out or be filtered on the next rebuild
      console.log(`[FeedFanout] Connection removed: ${userId1} <-> ${userId2}`);
    } catch (error) {
      console.error("[FeedFanout] Error handling connection removed:", error);
    }
  }

  /**
   * Get cached connection IDs or fetch from DB
   */
  private async getConnectionIds(userId: string): Promise<string[]> {
    // Try cache first
    const cached = await this.feedCache.getConnectionIds(userId);
    if (cached) {
      return cached;
    }

    // Fetch from DB and cache
    const ids = await this.connectionsService.getConnectionUserIds(userId);
    await this.feedCache.cacheConnectionIds(userId, ids);
    return ids;
  }
}
