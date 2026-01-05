# Feed Architecture

Pregenerated feed system with hybrid pull+push model for fast, scalable delivery.

---

## Feed Algorithm

### Feed Types

| User State                | Feed Composition                                       |
| ------------------------- | ------------------------------------------------------ |
| **Guest** (not logged in) | 100% Trending + Promoted                               |
| **Logged-in**             | 70% Connections + 25% Trending/Discovery + 5% Promoted |

### Scoring Function

Each post gets a **relevance score** for ranking:

```
score = baseScore × recencyDecay × engagementBoost × affinityBonus

where:
  baseScore     = 1.0 (connection) | 0.6 (trending) | 0.8 (promoted)
  recencyDecay  = exp(-λ × hoursOld)      // λ = 0.02, halflife ~35 hours
  engagementBoost = 1 + log10(likes + comments × 2 + 1)
  affinityBonus = 1.0 + (interactionHistory × 0.5)  // 0-1 based on past interactions
```

### Blending Algorithm

```
┌─────────────────────────────────────────────────────────────┐
│                    FEED BLEND (Logged-in)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Connections  │  │  Trending    │  │  Promoted    │      │
│  │   Posts      │  │  Discovery   │  │   (Future)   │      │
│  │   (70%)      │  │   (25%)      │  │    (5%)      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         └────────────┬────┴─────────────────┘               │
│                      ▼                                      │
│              ┌──────────────┐                               │
│              │ Score & Rank │                               │
│              └──────┬───────┘                               │
│                     ▼                                       │
│              ┌──────────────┐                               │
│              │   Interleave │  ← Ensure variety             │
│              └──────┬───────┘                               │
│                     ▼                                       │
│              ┌──────────────┐                               │
│              │   Return N   │                               │
│              └──────────────┘                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Trending Detection

Posts qualify as "trending" based on **engagement velocity**:

```typescript
trendingScore = (likes + comments × 2) / (hoursOld + 1)²

// Threshold: trendingScore > 5.0 for hot, > 2.0 for warm
```

Trending posts are cached in `trending_posts` sorted set (refreshed every 5 min).

### Interleaving Strategy

To ensure feed variety, we interleave rather than pure-sort:

```
Position 1-3:  Best from connections
Position 4:    Best from trending (if not already seen)
Position 5-7:  Next from connections
Position 8:    Trending/discovery
Position 9:    [Reserved for promoted - future]
Position 10+:  Repeat pattern
```

### Guest Feed

For non-authenticated users:

1. Serve from `trending_posts` sorted set
2. Mix in promoted content at defined slots
3. No personalization - fully cacheable at CDN level

### Promoted Posts (Future)

Reserved slots for promoted content:

- Positions: 9, 19, 29... (every 10th after 9)
- Marked with `isPromoted: true` in response
- Integration point: `PromotedPostsService.getPromotedFor(userId, context)`

---

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         WRITE PATH                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Post Created ──▶ Event Bus ──▶ FeedFanoutService              │
│                                        │                        │
│                                        ▼                        │
│                              ┌─────────────────┐                │
│                              │ Get Connections │                │
│                              └────────┬────────┘                │
│                                       │                         │
│                    ┌──────────────────┼──────────────────┐      │
│                    ▼                  ▼                  ▼      │
│            timeline:user1      timeline:user2      timeline:N   │
│            (Redis ZSET)        (Redis ZSET)        (Redis ZSET) │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         READ PATH                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   GET /feed ──▶ FeedService                                     │
│                     │                                           │
│                     ▼                                           │
│              ┌─────────────┐                                    │
│              │ Redis ZSET  │◀─── Cache Hit (fast path)          │
│              │ timeline:X  │                                    │
│              └──────┬──────┘                                    │
│                     │ Post IDs                                  │
│                     ▼                                           │
│              ┌─────────────┐                                    │
│              │ Hydrate     │◀─── Fetch full post data           │
│              │ from Redis  │     (cached) or PostgreSQL         │
│              └──────┬──────┘                                    │
│                     │                                           │
│                     ▼                                           │
│              ┌─────────────┐                                    │
│              │ Cache Miss? │──▶ Rebuild from PostgreSQL         │
│              └─────────────┘                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Redis Data Structures

### Timeline (Sorted Set)

```
Key:    timeline:{userId}
Type:   Sorted Set (ZSET)
Score:  Unix timestamp (milliseconds)
Member: Post ID (UUID)
TTL:    7 days
Max:    500 entries per user
```

**Operations:**

```bash
# Add post to timeline
ZADD timeline:user123 1704288000000 "post-uuid-abc"

# Get latest 20 posts
ZREVRANGE timeline:user123 0 19

# Cursor-based pagination (posts before timestamp)
ZREVRANGEBYSCORE timeline:user123 1704287999999 -inf LIMIT 0 20

# Remove post
ZREM timeline:user123 "post-uuid-abc"

# Trim to last 500
ZREMRANGEBYRANK timeline:user123 0 -501
```

### Post Cache (Hash)

```
Key:    post:{postId}
Type:   Hash
TTL:    1 hour
```

**Fields:**

```
id, authorId, content, media, visibility, likeCount,
commentCount, createdAt, author.id, author.name, author.image
```

### Connection IDs (Set)

```
Key:   connections:{userId}
Type:  Set
TTL:   5 minutes
```

### Celebrity Posts (Sorted Set)

```
Key:    celebrity_posts:{userId}
Type:   Sorted Set (ZSET)
Score:  Unix timestamp (milliseconds)
Member: Post ID (UUID)
TTL:    7 days
Max:    100 entries per celebrity
```

### Celebrity Registry (Set)

```
Key:   celebrities
Type:  Set (of user IDs with ≥1000 connections)
TTL:   None (maintained by threshold checks)
```

### Trending Posts (Sorted Set)

```
Key:    trending_posts
Type:   Sorted Set (ZSET)
Score:  Trending score (engagement velocity)
Member: Post ID (UUID)
TTL:    5 minutes (refreshed by cron job)
Max:    200 entries
```

**Trending Score Calculation:**

```
score = (likes + comments × 2) / (hoursOld + 1)²
```

### Guest Feed (Sorted Set)

```
Key:    guest_feed
Type:   Sorted Set (ZSET)
Score:  Composite score (trending + recency)
Member: Post ID (UUID)
TTL:    5 minutes
Max:    100 entries
```

## Components

### 1. FeedModule

Central module that wires together all feed services.

```typescript
@Module({
  imports: [
    PostsModule,
    ConnectionsModule,
    SharedModule, // EventBus, Redis
  ],
  providers: [
    FeedService,
    FeedFanoutService,
    FeedCacheService,
    FeedEventHandlers,
  ],
  controllers: [FeedController],
  exports: [FeedService],
})
export class FeedModule {}
```

### 2. FeedService

Orchestrates feed reads with cache-first strategy.

```typescript
interface FeedResponse {
  posts: Post[];
  nextCursor: string | null;
}

class FeedService {
  // Main entry point
  async getFeed(
    userId: string,
    cursor?: string,
    limit = 20
  ): Promise<FeedResponse>;

  // Rebuild timeline for cold users
  async rebuildTimeline(userId: string): Promise<void>;

  // Pre-warm cache on login
  async warmCache(userId: string): Promise<void>;
}
```

**Algorithm:**

```
1. ZREVRANGEBYSCORE timeline:{userId} {cursor} -inf LIMIT 0 {limit+1}
2. If empty → rebuildTimeline() → retry step 1
3. Extract nextCursor from last item if length > limit
4. Batch fetch post data: HMGET post:{id} for each ID
5. For cache misses → query PostgreSQL → cache results
6. Return { posts, nextCursor }
```

### 3. FeedFanoutService

Pushes new posts to follower timelines.

```typescript
class FeedFanoutService {
  @OnEvent('post.created')
  async handlePostCreated(event: PostCreatedEvent): Promise<void>

  @OnEvent('post.deleted')
  async handlePostDeleted(event: PostDeletedEvent): Promise<void>
}
```

**Fan-out Strategy (Hybrid):**

| User Type | Threshold          | Strategy         |
| --------- | ------------------ | ---------------- |
| Regular   | < 1000 connections | Fan-out on Write |
| Celebrity | ≥ 1000 connections | Fan-out on Read  |

**Regular users:** Push to all follower timelines on write

```
Post created → ZADD to each follower's timeline:{userId}
```

**Celebrity users:** Store in author's outbox, merge at read time

```
Post created → ZADD celebrity_posts:{authorId} only
Feed read → Merge timeline + celebrity posts from followed celebrities
```

```typescript
const CELEBRITY_THRESHOLD = 1000;

async fanOutPost(postId: string, authorId: string, timestamp: number) {
  const followerCount = await this.getFollowerCount(authorId);

  if (followerCount >= CELEBRITY_THRESHOLD) {
    // Celebrity: store in author's outbox only (cheap)
    await this.redis.zadd(`celebrity_posts:${authorId}`, timestamp, postId);
    await this.redis.zremrangebyrank(`celebrity_posts:${authorId}`, 0, -101);
    // Mark user as celebrity for read-path merge
    await this.redis.sadd('celebrities', authorId);
  } else {
    // Regular: fan-out to all followers (affordable)
    const followerIds = await this.getFollowerIds(authorId);
    const pipeline = this.redis.pipeline();
    for (const followerId of followerIds) {
      pipeline.zadd(`timeline:${followerId}`, timestamp, postId);
      pipeline.zremrangebyrank(`timeline:${followerId}`, 0, -501);
    }
    await pipeline.exec();
  }
}
```

**Read path merges celebrity posts:**

```typescript
async getFeed(userId: string, cursor: string, limit: number) {
  // 1. Get user's pregenerated timeline
  const timelinePosts = await this.getTimeline(userId, cursor, limit * 2);

  // 2. Find celebrities this user follows
  const connections = await this.getConnectionIds(userId);
  const celebrities = await this.redis.sinter('celebrities', connections);

  // 3. Fetch recent posts from each celebrity
  const celebrityPosts = [];
  for (const celeb of celebrities) {
    const posts = await this.redis.zrevrangebyscore(
      `celebrity_posts:${celeb}`, cursor || '+inf', '-inf', 'LIMIT', 0, 10
    );
    celebrityPosts.push(...posts);
  }

  // 4. Merge, dedupe, sort by timestamp, take limit
  const merged = [...new Set([...timelinePosts, ...celebrityPosts])]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

  return merged;
}
```

### 4. FeedCacheService

Low-level Redis operations.

```typescript
class FeedCacheService {
  // Timeline operations
  async getTimeline(
    userId: string,
    cursor: string,
    limit: number
  ): Promise<string[]>;
  async addToTimeline(
    userId: string,
    postId: string,
    timestamp: number
  ): Promise<void>;
  async removeFromTimeline(userId: string, postId: string): Promise<void>;
  async trimTimeline(userId: string, maxSize: number): Promise<void>;

  // Post cache operations
  async cachePost(post: Post): Promise<void>;
  async getCachedPosts(postIds: string[]): Promise<Map<string, Post | null>>;

  // Connection cache
  async getConnectionIds(userId: string): Promise<string[] | null>;
  async cacheConnectionIds(userId: string, ids: string[]): Promise<void>;
  async invalidateConnectionIds(userId: string): Promise<void>;
}
```

### 5. FeedEventHandlers

Subscribes to domain events for cache maintenance.

| Event                  | Handler                                    |
| ---------------------- | ------------------------------------------ |
| `post.created`         | Fan-out to connections, cache post         |
| `post.updated`         | Update cached post                         |
| `post.deleted`         | Remove from all affected timelines         |
| `connections.accepted` | Backfill last 20 posts from new connection |
| `connections.removed`  | Remove connection's posts from timeline    |

## API

### GET /feed

**Request:**

```
GET /feed?cursor=1704288000000&limit=20
Authorization: Bearer <token>
```

**Response:**

```json
{
  "posts": [
    {
      "id": "uuid",
      "content": "...",
      "author": { "id": "...", "name": "...", "image": "..." },
      "likeCount": 42,
      "commentCount": 5,
      "hasLiked": false,
      "createdAt": "2024-01-03T10:00:00Z"
    }
  ],
  "nextCursor": "1704284400000"
}
```

**Cursor Logic:**

- First request: no cursor → get latest
- Subsequent: pass `nextCursor` from previous response
- `nextCursor: null` → no more posts

## Database Index

```sql
-- Composite index for efficient fallback queries
CREATE INDEX CONCURRENTLY idx_post_feed_cursor
ON post (created_at DESC, id DESC)
WHERE is_deleted = false;

-- For connection lookups during fan-out
CREATE INDEX CONCURRENTLY idx_connection_accepted
ON connection (requester_id, addressee_id)
WHERE status = 'accepted';
```

## Performance Targets

| Metric                 | Target                      |
| ---------------------- | --------------------------- |
| Feed load (cache hit)  | < 50ms                      |
| Feed load (cache miss) | < 200ms                     |
| Fan-out latency        | < 100ms for 500 connections |
| Timeline rebuild       | < 500ms                     |

## Graceful Degradation

If Redis is unavailable:

1. `FeedCacheService` returns `null` for all cache operations
2. `FeedService` falls back to direct PostgreSQL queries
3. Fan-out is skipped (posts still in DB for later rebuild)

## File Structure

```
src/feed/
├── feed.module.ts
├── feed.controller.ts
├── feed.service.ts
├── feed-cache.service.ts
├── feed-fanout.service.ts
├── feed-event-handlers.ts
├── dto/
│   ├── feed-query.dto.ts
│   └── feed-response.dto.ts
└── interfaces/
    └── feed.interface.ts
```
