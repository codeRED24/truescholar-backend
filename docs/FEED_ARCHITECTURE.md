# Feed Service Architecture

> A comprehensive guide to the TrueScholar feed system for engineers.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [File Structure](#file-structure)
4. [Services Explained](#services-explained)
5. [Redis Data Structures](#redis-data-structures)
6. [Redis Operations Reference](#redis-operations-reference)
7. [Fan-Out Strategies](#fan-out-strategies)
8. [Trending Algorithm](#trending-algorithm)
9. [Feed Blending](#feed-blending)
10. [Cursor-Based Pagination](#cursor-based-pagination)
11. [API Reference](#api-reference)
12. [Flow Diagrams](#flow-diagrams)
13. [Performance Considerations](#performance-considerations)

---

## Overview

The feed system delivers personalized content to users by combining:

- **Connection posts** (70%) - Posts from people you're connected with
- **Trending posts** (25%) - Viral/popular content for discovery
- **Promoted posts** (5%) - Reserved for future sponsored content

### Key Design Decisions

| Decision   | Choice                  | Why                                                  |
| ---------- | ----------------------- | ---------------------------------------------------- |
| Caching    | Redis                   | Sub-millisecond reads, sorted sets for ordering      |
| Fan-out    | Hybrid                  | Balance between write amplification and read latency |
| Pagination | Cursor-based            | Works with real-time data, no duplicates             |
| Scoring    | Time-decay + engagement | Fresh relevant content surfaces first                |

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT REQUEST                                    │
│                      GET /feed?cursor=X&limit=20                           │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                          FeedController                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  GET /feed       │  │  GET /feed/guest │  │  GET /feed/warm  │         │
│  │  (authenticated) │  │  (public)        │  │  (cache warmup)  │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           FeedService                                       │
│                    "The Brain" - Orchestrates Everything                    │
│                                                                             │
│  1. Fetch connection posts (from cache or rebuild)                         │
│  2. Fetch trending posts (for discovery blend)                             │
│  3. Fetch celebrity posts (fan-out on read)                                │
│  4. Merge, deduplicate, score, and interleave                              │
│  5. Hydrate with full post data                                            │
│  6. Get like statuses for user                                             │
│  7. Return paginated response                                              │
└────────────────────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  FeedCacheService│  │ TrendingService  │  │   PostgreSQL     │
│  (Redis Layer)   │  │ (Cron-based)     │  │   (Fallback)     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              REDIS                                          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │ timeline:{uid}  │ │ trending_posts  │ │ post:{id}       │               │
│  │ (Sorted Set)    │ │ (Sorted Set)    │ │ (Hash)          │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │celebrity_posts: │ │ connections:    │ │ celebrities     │               │
│  │ {uid}           │ │ {uid}           │ │ (Set)           │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                        FeedFanoutService                                    │
│                  Listens to Events, Updates Timelines                       │
│                                                                             │
│  Events:                                                                    │
│  • post.created → Fan-out to follower timelines                            │
│  • post.deleted → Remove from all timelines                                │
│  • connections.accepted → Invalidate connection cache                      │
│  • connections.removed → Invalidate connection cache                       │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/feed/
├── feed.module.ts           # NestJS module definition
├── feed.controller.ts       # HTTP API endpoints
├── feed.service.ts          # Main orchestration service
├── feed-cache.service.ts    # Redis caching layer
├── feed-fanout.service.ts   # Event-driven timeline updates
├── trending.service.ts      # Trending algorithm + cron job
├── index.ts                 # Public exports
├── dto/
│   ├── index.ts
│   ├── feed-query.dto.ts    # Request validation
│   └── feed-response.dto.ts # Response types
└── __tests__/               # Unit tests
```

---

## Services Explained

### 1. FeedController

**Purpose**: HTTP API entry point

| Endpoint          | Auth     | Description                   |
| ----------------- | -------- | ----------------------------- |
| `GET /feed`       | Required | Personalized blended feed     |
| `GET /feed/guest` | Public   | Trending-only feed for guests |
| `GET /feed/warm`  | Required | Pre-populate cache on login   |

```typescript
// Example authenticated request
GET /feed?limit=20&cursor=1704800000000
Authorization: Bearer <token>
```

---

### 2. FeedService

**Purpose**: Core business logic, orchestrates all feed operations

#### Key Methods

| Method                  | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `getFeed()`             | Main entry - blended feed for logged-in users  |
| `getGuestFeed()`        | Trending-only feed for unauthenticated users   |
| `getConnectionPosts()`  | Fetch from pregenerated timeline cache         |
| `rebuildTimeline()`     | Database fallback if cache miss                |
| `getTrendingForBlend()` | Get trending posts for discovery mix           |
| `getCelebrityPosts()`   | Fan-out on read for high-follower users        |
| `hydratePosts()`        | Convert post IDs to full post objects          |
| `warmCache()`           | Pre-populate cache for faster subsequent loads |

#### Feed Algorithm Flow

```
1. getConnectionPosts()     → 70% of feed (from people you follow)
2. getTrendingForBlend()    → 25% of feed (discovery content)
3. getCelebrityPosts()      → Merged with connection posts
4. mergeAndDedupe()         → Remove duplicates, sort by score
5. interleave()             → Mix sources at specific positions
6. hydratePosts()           → Fetch full post data
7. getLikeStatuses()        → Check which posts user has liked
8. mapToResponse()          → Format for API response
```

---

### 3. FeedCacheService

**Purpose**: Redis abstraction layer for all caching operations

#### Timeline Operations (Sorted Sets)

| Method                 | Redis Commands                      | Purpose                |
| ---------------------- | ----------------------------------- | ---------------------- |
| `getTimeline()`        | `ZREVRANGEBYSCORE`                  | Get user's cached feed |
| `addToTimeline()`      | `ZADD`, `ZREMRANGEBYRANK`, `EXPIRE` | Add post to feed       |
| `addToTimelines()`     | Multiple `ZADD` (pipelined)         | Batch fan-out          |
| `removeFromTimeline()` | `ZREM`                              | Remove deleted post    |

#### Celebrity Operations

| Method                  | Redis Commands              | Purpose                 |
| ----------------------- | --------------------------- | ----------------------- |
| `addToCelebrityPosts()` | `ZADD`, `SADD`              | Store in outbox         |
| `getCelebrityPosts()`   | Multiple `ZREVRANGEBYSCORE` | Fan-out on read         |
| `filterCelebrities()`   | `SISMEMBER` (pipelined)     | Check who's a celebrity |

#### Post Cache Operations (Hashes)

| Method             | Redis Commands        | Purpose            |
| ------------------ | --------------------- | ------------------ |
| `cachePost()`      | `HSET`, `EXPIRE`      | Store post data    |
| `getCachedPosts()` | `HGETALL` (pipelined) | Fetch cached posts |
| `invalidatePost()` | `DEL`                 | Remove stale data  |

#### Connection Cache Operations (Sets)

| Method                      | Redis Commands   | Purpose                    |
| --------------------------- | ---------------- | -------------------------- |
| `getConnectionIds()`        | `SMEMBERS`       | Get who user follows       |
| `cacheConnectionIds()`      | `SADD`, `EXPIRE` | Cache connection list      |
| `invalidateConnectionIds()` | `DEL`            | Clear on connection change |

---

### 4. FeedFanoutService

**Purpose**: Event-driven timeline updates

#### Event Subscriptions

```typescript
// On module initialization
this.eventBus.subscribe("post.created", this.handlePostCreated);
this.eventBus.subscribe("post.deleted", this.handlePostDeleted);
this.eventBus.subscribe("connections.accepted", this.handleConnectionAccepted);
this.eventBus.subscribe("connections.removed", this.handleConnectionRemoved);
```

#### Post Created Handler

```typescript
async handlePostCreated(event) {
  const { postId, authorId, visibility } = event.payload;

  // Skip private posts
  if (visibility === 'private') return;

  const connectionIds = await this.getConnectionIds(authorId);

  if (connectionIds.length >= CELEBRITY_THRESHOLD) {  // 1000+
    // Celebrity: store in outbox only (fan-out on read)
    await this.feedCache.addToCelebrityPosts(authorId, postId, timestamp);
  } else {
    // Regular user: push to all connections (fan-out on write)
    await this.feedCache.addToTimelines(connectionIds, postId, timestamp);
  }

  // Always add to author's own timeline
  await this.feedCache.addToTimeline(authorId, postId, timestamp);
}
```

---

### 5. TrendingService

**Purpose**: Calculate and cache trending/viral posts

#### Trending Score Formula

```typescript
calculateTrendingScore(likes: number, comments: number, createdAt: Date): number {
  const hoursOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const engagement = likes + comments * 2;  // Comments worth 2x

  // Quadratic decay: recent + engaging = high score
  return engagement / Math.pow(hoursOld + 1, 2);
}
```

**Examples:**

| Post Age | Likes | Comments | Score                    |
| -------- | ----- | -------- | ------------------------ |
| 1 hour   | 100   | 50       | (100 + 100) / 4 = 50     |
| 6 hours  | 100   | 50       | (100 + 100) / 49 = 4.08  |
| 24 hours | 100   | 50       | (100 + 100) / 625 = 0.32 |

#### Cron Job

```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
async refreshTrendingPosts() {
  // 1. Fetch recent public posts (last 48 hours)
  // 2. Calculate trending scores
  // 3. Sort and take top 200
  // 4. Update Redis sorted set
  // 5. Also update guest_feed (top 100)
}
```

---

## Redis Data Structures

### Complete Key Reference

| Key Pattern                | Type       | TTL    | Max Size | Purpose                    |
| -------------------------- | ---------- | ------ | -------- | -------------------------- |
| `timeline:{userId}`        | Sorted Set | 7 days | 500      | User's pregenerated feed   |
| `celebrity_posts:{userId}` | Sorted Set | 7 days | 100      | Celebrity's recent posts   |
| `trending_posts`           | Sorted Set | 5 min  | 200      | Global trending            |
| `guest_feed`               | Sorted Set | 5 min  | 100      | For unauthenticated users  |
| `post:{postId}`            | Hash       | 1 hour | N/A      | Cached post data           |
| `connections:{userId}`     | Set        | 5 min  | N/A      | Cached connection IDs      |
| `celebrities`              | Set        | N/A    | N/A      | List of celebrity user IDs |

### Why Sorted Sets for Timelines?

```
Sorted Set Structure:
┌──────────────┬───────────────────┐
│ Member       │ Score             │
│ (Post ID)    │ (Timestamp)       │
├──────────────┼───────────────────┤
│ post-abc     │ 1704900000000     │
│ post-def     │ 1704800000000     │
│ post-ghi     │ 1704700000000     │
└──────────────┴───────────────────┘

Benefits:
✓ O(log N) insert/delete
✓ O(log N + M) range queries (M = results)
✓ Natural ordering by timestamp
✓ Efficient pagination with ZREVRANGEBYSCORE
✓ Easy trimming with ZREMRANGEBYRANK
```

---

## Redis Operations Reference

### ZADD - Add to Sorted Set

```typescript
pipeline.zadd("timeline:user123", 1704800000000, "post-abc");
// ZADD key score member
// If member exists, updates the score
```

### ZREVRANGEBYSCORE - Range Query (Descending)

```typescript
redis.zrevrangebyscore(
  "timeline:user123", // Key
  "+inf", // Max score (no limit)
  "-inf", // Min score (no limit)
  "WITHSCORES", // Return scores too
  "LIMIT",
  0,
  21 // Offset, count
);
// Returns: ['post-abc', '1704900000', 'post-def', '1704800000', ...]
```

### ZREMRANGEBYRANK - Trim by Rank

```typescript
pipeline.zremrangebyrank("timeline:user123", 0, -501);
// Removes all except last 500 items
// Negative indices count from end: -1 = last, -501 = 500th from end
```

### HSET - Set Hash Fields

```typescript
redis.hset("post:abc", {
  id: "abc",
  content: "Hello world",
  likeCount: "42",
  "author.name": "John Doe",
});
```

### Pipeline (Batch Commands)

```typescript
const pipeline = redis.pipeline();
pipeline.zadd("timeline:user1", ts, postId);
pipeline.zadd("timeline:user2", ts, postId);
pipeline.zadd("timeline:user3", ts, postId);
await pipeline.exec(); // Single round-trip!
```

---

## Fan-Out Strategies

### The Problem

When a user creates a post, how do we show it to all their followers efficiently?

### Strategy Comparison

| Strategy         | Write Cost   | Read Cost    | Best For      |
| ---------------- | ------------ | ------------ | ------------- |
| Fan-out on Write | O(followers) | O(1)         | Regular users |
| Fan-out on Read  | O(1)         | O(following) | Celebrities   |

### This System: Hybrid Approach

```
┌────────────────────────────────────────────────────────────────┐
│                     User Creates Post                          │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Follower Count? │
                    └─────────────────┘
                     /              \
              < 1000                 >= 1000
                /                        \
               ▼                          ▼
    ┌─────────────────────┐    ┌─────────────────────┐
    │  FAN-OUT ON WRITE   │    │  FAN-OUT ON READ    │
    │                     │    │                     │
    │  Push to ALL        │    │  Store in author's  │
    │  follower timelines │    │  outbox only        │
    │                     │    │                     │
    │  O(999) writes      │    │  O(1) write         │
    │  O(1) reads later   │    │  O(N) reads later   │
    └─────────────────────┘    └─────────────────────┘
```

### Why 1000 Threshold?

- Writing to 1000 timelines is fast enough (~100ms with pipelining)
- Above 1000, write amplification becomes expensive
- Celebrities post less frequently, so read-time merge is acceptable

---

## Trending Algorithm

### Score Calculation

```
                engagement
Score = ─────────────────────────
        (hoursOld + 1)²

Where:
  engagement = likes + (comments × 2)
```

### Decay Visualization

```
Score │
100%  │●
      │  ●
 50%  │    ●
      │       ●
 25%  │          ●
      │              ●  ●  ●  ●  ●
  0%  └──────────────────────────────── Hours
      0  1  2  3  4  5  10    24    48
```

### Why Quadratic Decay?

- Linear decay: Old viral content stays visible too long
- Exponential: Too aggressive, good content disappears too fast
- Quadratic: Sweet spot - rewards velocity, allows sustained virality

---

## Feed Blending

### Content Mix

```
┌────────────────────────────────────────────────────────────────┐
│                        FINAL FEED                               │
├────────────────────────────────────────────────────────────────┤
│  Position 1:  Connection Post                                  │
│  Position 2:  Connection Post                                  │
│  Position 3:  Connection Post                                  │
│  Position 4:  █████ TRENDING POST █████  ← Discovery           │
│  Position 5:  Connection Post                                  │
│  Position 6:  Connection Post                                  │
│  Position 7:  Connection Post                                  │
│  Position 8:  █████ TRENDING POST █████                        │
│  Position 9:  Connection Post                                  │
│  ...                                                           │
└────────────────────────────────────────────────────────────────┘
```

### Interleaving Logic

```typescript
const TRENDING_POSITIONS = [4, 8, 12, 16, 20];

function interleave(posts, limit) {
  const connectionPosts = posts.filter((p) => p.source === "connection");
  const trendingPosts = posts.filter((p) => p.source === "trending");

  const result = [];
  let connIdx = 0,
    trendIdx = 0;

  for (let pos = 1; pos <= limit; pos++) {
    if (TRENDING_POSITIONS.includes(pos) && trendingPosts[trendIdx]) {
      result.push(trendingPosts[trendIdx++]);
    } else if (connectionPosts[connIdx]) {
      result.push(connectionPosts[connIdx++]);
    } else if (trendingPosts[trendIdx]) {
      result.push(trendingPosts[trendIdx++]); // Fallback
    }
  }

  return result;
}
```

---

## Cursor-Based Pagination

### Why Not Offset Pagination?

```
OFFSET PAGINATION PROBLEM:

Initial: [A, B, C, D, E]        Page 1 = A, B
                                Page 2 = C, D

New post X added...

After:   [X, A, B, C, D, E]     Page 2 = B, C  ← B is DUPLICATED!
```

### How Cursors Work

```
REQUEST 1: GET /feed?limit=3
Response: [Post A, Post B, Post C]
nextCursor: "1704800000" (timestamp of Post C)

REQUEST 2: GET /feed?limit=3&cursor=1704800000
Server: "Give me posts with timestamp < 1704800000"
Response: [Post D, Post E, Post F]
nextCursor: "1704650000"
```

### Implementation

```typescript
async getTimeline(userId, cursor, limit) {
  // If cursor provided, get posts OLDER than cursor
  // Subtract 1 to exclude the cursor post itself
  const maxScore = cursor ? parseFloat(cursor) - 1 : '+inf';

  return redis.zrevrangebyscore(
    `timeline:${userId}`,
    maxScore,        // Start from here
    '-inf',          // Go to oldest
    'LIMIT', 0, limit + 1  // +1 to check for next page
  );
}
```

### Handling New Posts

```
User is scrolling (cursor-based):   New posts appear:

[Post A] ◄── User started here     [NEW POST X] ◄── Not visible!
[Post B]                            [NEW POST Y] ◄── Not visible!
[Post C] ◄── cursor here           [Post A]
[Post D] ◄── Will fetch these      [Post B]
[Post E]                            [Post C] ◄── cursor
                                    [Post D]
                                    [Post E]

To see new posts: Refresh / scroll to top / "New posts" banner
```

---

## API Reference

### GET /feed

**Auth**: Required (Bearer token)

**Query Parameters:**

| Param    | Type   | Default | Description                   |
| -------- | ------ | ------- | ----------------------------- |
| `limit`  | number | 20      | Posts per page (max 50)       |
| `cursor` | string | -       | Pagination cursor (timestamp) |

**Response:**

```json
{
  "posts": [
    {
      "id": "post-uuid",
      "content": "Hello world!",
      "media": [
        {
          "url": "https://...",
          "type": "image",
          "thumbnailUrl": "https://..."
        }
      ],
      "visibility": "public",
      "authorType": "student",
      "type": null,
      "taggedCollegeId": 123,
      "likeCount": 42,
      "commentCount": 7,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "user-uuid",
        "name": "John Doe",
        "image": "https://...",
        "user_type": "student"
      },
      "hasLiked": false
    }
  ],
  "nextCursor": "1704800000000"
}
```

### GET /feed/guest

**Auth**: None

Same response format, but `hasLiked` is always `false`.

### GET /feed/warm

**Auth**: Required

Warms the cache for faster subsequent loads.

**Response:**

```json
{
  "success": true
}
```

---

## Flow Diagrams

### Authenticated User Feed Request

```
┌──────────┐     GET /feed      ┌────────────────┐
│  Client  │───────────────────▶│  FeedController │
└──────────┘                    └────────────────┘
                                        │
                                        ▼
                               ┌────────────────┐
                               │   FeedService  │
                               │    getFeed()   │
                               └────────────────┘
                                        │
          ┌──────────────┬──────────────┼──────────────┐
          ▼              ▼              ▼              ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │ Connection  │ │  Celebrity  │ │  Trending   │ │    Like     │
   │   Posts     │ │   Posts     │ │   Posts     │ │  Statuses   │
   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
          │              │              │              │
          └──────────────┴──────────────┴──────────────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │ Merge, Dedupe  │
                        │  Interleave    │
                        └────────────────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │ Hydrate Posts  │
                        │ (Cache → DB)   │
                        └────────────────┘
                                 │
                                 ▼
                        ┌────────────────┐
                        │   Response     │
                        │ { posts, next }│
                        └────────────────┘
```

### Post Creation Fan-Out

```
┌──────────┐   POST /posts    ┌─────────────────┐
│  Author  │─────────────────▶│  PostsService   │
└──────────┘                  └─────────────────┘
                                      │
                                      │ Emit: post.created
                                      ▼
                              ┌─────────────────┐
                              │ FeedFanoutSvc   │
                              └─────────────────┘
                                      │
                           ┌──────────┴──────────┐
                           ▼                     ▼
                   Followers < 1000      Followers >= 1000
                           │                     │
                           ▼                     ▼
                ┌─────────────────┐    ┌─────────────────┐
                │ Write to ALL    │    │ Write to author │
                │ timelines       │    │ outbox only     │
                │ (fan-out write) │    │ (fan-out read)  │
                └─────────────────┘    └─────────────────┘
```

---

## Performance Considerations

### Latency Targets

| Operation            | Target  | Achieved Via           |
| -------------------- | ------- | ---------------------- |
| Cache hit            | < 10ms  | Redis + pipelining     |
| Cache miss           | < 100ms | DB query + async cache |
| Trending refresh     | < 5s    | Background cron job    |
| Fan-out (1000 users) | < 200ms | Redis pipelines        |

### Scaling Strategies

1. **Redis Cluster**: Shard by user ID for horizontal scaling
2. **Read Replicas**: Route reads to replicas, writes to primary
3. **Async Fan-out**: Use job queue for large fan-outs
4. **Edge Caching**: Cache guest feeds at CDN level

### Memory Optimization

- Timeline TTL: 7 days (inactive users cleaned up)
- Max timeline size: 500 posts (oldest trimmed)
- Post cache TTL: 1 hour (frequently accessed re-cached)
- Connection cache TTL: 5 minutes (tolerate slight staleness)

---

## Debugging Tips

### Check User's Timeline

```bash
redis-cli ZREVRANGE timeline:USER_ID 0 10 WITHSCORES
```

### Check Trending Posts

```bash
redis-cli ZREVRANGE trending_posts 0 10 WITHSCORES
```

### Check if User is Celebrity

```bash
redis-cli SISMEMBER celebrities USER_ID
```

### Clear User's Timeline Cache

```bash
redis-cli DEL timeline:USER_ID
```

### Force Trending Refresh

```typescript
// Call manually
await trendingService.refreshTrendingPosts();
```

---

_Last updated: January 2026_
