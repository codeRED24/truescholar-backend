/**
 * Feed Load Simulation Script
 *
 * Simulates realistic user activity with posts, likes, comments
 * Run with: npx ts-node src/feed/__tests__/load-simulation.ts
 */

import Redis from "ioredis";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_USERNAME = process.env.REDIS_USERNAME;

// Simulation parameters
const NUM_USERS = 5000;
const NUM_POSTS = 25000;
const CONNECTIONS_PER_USER = 100;
const LIKES_PER_POST_AVG = 50;
const CELEBRITY_THRESHOLD = 500; // Realistic high-scale threshold

interface SimUser {
  id: string;
  name: string;
  connectionCount: number;
  isCelebrity: boolean;
}

interface SimPost {
  id: string;
  authorId: string;
  timestamp: number;
  likes: number;
  comments: number;
}

class FeedLoadSimulator {
  private redis: Redis;
  private users: SimUser[] = [];
  private posts: SimPost[] = [];
  private connections: Map<string, Set<string>> = new Map();

  constructor() {
    this.redis = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      username: REDIS_USERNAME,
      password: REDIS_PASSWORD,
    });
  }

  async run() {
    console.log("🚀 Starting Feed Load Simulation\n");

    // Phase 1: Generate users
    await this.generateUsers();

    // Phase 2: Generate connections
    await this.generateConnections();

    // Phase 3: Generate posts
    await this.generatePosts();

    // Phase 4: Simulate likes
    await this.simulateLikes();

    // Phase 5: Populate timelines
    await this.populateTimelines();

    // Phase 6: Generate trending
    await this.generateTrending();

    // Phase 7: Verify and report
    await this.verify();

    console.log("\n✅ Simulation complete!");
    await this.redis.quit();
  }

  private async generateUsers() {
    console.log(`📝 Creating ${NUM_USERS} simulated users...`);

    for (let i = 0; i < NUM_USERS; i++) {
      const user: SimUser = {
        id: randomUUID(),
        name: `User_${i}`,
        connectionCount: 0,
        isCelebrity: false,
      };
      this.users.push(user);
    }

    console.log(`   Created ${this.users.length} users`);
  }

  private async generateConnections() {
    console.log(`🔗 Creating connections between users...`);

    let totalConnections = 0;

    // Force first 3 users to be celebrities by making everyone follow them
    const celebCandidates = this.users.slice(0, 3);
    for (const celeb of celebCandidates) {
      celeb.isCelebrity = true;
      for (const follower of this.users) {
        if (follower.id === celeb.id) continue;

        if (!this.connections.has(follower.id)) {
          this.connections.set(follower.id, new Set());
        }
        this.connections.get(follower.id)!.add(celeb.id);
        celeb.connectionCount++;
        totalConnections++;
      }
    }

    // Generate random connections for the rest
    for (const user of this.users) {
      const userConnections =
        this.connections.get(user.id) || new Set<string>();
      const numRandom = Math.max(
        0,
        CONNECTIONS_PER_USER - userConnections.size
      );

      for (let i = 0; i < numRandom; i++) {
        const targetIdx = Math.floor(Math.random() * this.users.length);
        const targetUser = this.users[targetIdx];

        if (targetUser.id !== user.id && !userConnections.has(targetUser.id)) {
          userConnections.add(targetUser.id);
          targetUser.connectionCount++;
          totalConnections++;
        }
      }
      this.connections.set(user.id, userConnections);
      user.connectionCount = userConnections.size;
    }

    // Re-verify celebrity status based on threshold for others
    for (const user of this.users) {
      if (user.connectionCount >= CELEBRITY_THRESHOLD) {
        user.isCelebrity = true;
      }
    }

    const celebrities = this.users.filter((u) => u.isCelebrity);
    console.log(`   Created ${totalConnections} connections`);
    console.log(
      `   ${celebrities.length} users marked as celebrities (≥${CELEBRITY_THRESHOLD} connections)`
    );

    // Cache connection IDs in Redis
    const pipeline = this.redis.pipeline();
    for (const [userId, connections] of this.connections) {
      if (connections.size > 0) {
        pipeline.sadd(`connections:${userId}`, ...Array.from(connections));
        pipeline.expire(`connections:${userId}`, 300);
      }
    }
    await pipeline.exec();
  }

  private async generatePosts() {
    console.log(`📝 Creating ${NUM_POSTS} simulated posts...`);

    const now = Date.now();

    for (let i = 0; i < NUM_POSTS; i++) {
      const authorIdx = Math.floor(Math.random() * this.users.length);
      const hoursAgo = Math.random() * 72; // 0-72 hours ago

      const post: SimPost = {
        id: randomUUID(),
        authorId: this.users[authorIdx].id,
        timestamp: now - hoursAgo * 60 * 60 * 1000,
        likes: 0,
        comments: 0,
      };

      this.posts.push(post);
    }

    console.log(`   Created ${this.posts.length} posts`);
  }

  private async simulateLikes() {
    console.log(`❤️  Simulating likes on posts...`);

    let totalLikes = 0;

    for (const post of this.posts) {
      // Skewed distribution: some posts go viral
      const viral = Math.random() < 0.05; // 5% chance of viral
      const numLikes = viral
        ? Math.floor(Math.random() * 100) + 50
        : Math.floor(Math.random() * LIKES_PER_POST_AVG * 2);

      post.likes = numLikes;
      post.comments = Math.floor(numLikes * 0.2 + Math.random() * 3);
      totalLikes += numLikes;
    }

    console.log(`   Simulated ${totalLikes} likes`);
  }

  private async populateTimelines() {
    console.log(`📋 Populating timelines in Redis...`);

    const pipeline = this.redis.pipeline();
    let timelineEntries = 0;

    // Group posts by author
    const postsByAuthor = new Map<string, SimPost[]>();
    for (const post of this.posts) {
      if (!postsByAuthor.has(post.authorId)) {
        postsByAuthor.set(post.authorId, []);
      }
      postsByAuthor.get(post.authorId)!.push(post);
    }

    // Fan-out: add posts to follower timelines
    for (const [authorId, authorPosts] of postsByAuthor) {
      const author = this.users.find((u) => u.id === authorId)!;
      const followers = this.getFollowers(authorId);

      if (author.isCelebrity) {
        // Celebrity: store in outbox only
        for (const post of authorPosts) {
          pipeline.zadd(`celebrity_posts:${authorId}`, post.timestamp, post.id);
        }
        pipeline.zremrangebyrank(`celebrity_posts:${authorId}`, 0, -101);
        pipeline.sadd("celebrities", authorId);
      } else {
        // Regular: fan-out to followers
        for (const followerId of followers) {
          for (const post of authorPosts.slice(0, 10)) {
            // Limit to recent 10
            pipeline.zadd(`timeline:${followerId}`, post.timestamp, post.id);
            timelineEntries++;
          }
        }
      }

      // Add to author's own timeline
      for (const post of authorPosts) {
        pipeline.zadd(`timeline:${authorId}`, post.timestamp, post.id);
      }
    }

    // Trim timelines
    for (const user of this.users) {
      pipeline.zremrangebyrank(`timeline:${user.id}`, 0, -501);
    }

    await pipeline.exec();
    console.log(`   Created ${timelineEntries} timeline entries`);
  }

  private async generateTrending() {
    console.log(`🔥 Generating trending posts...`);

    // Calculate trending scores
    const scored = this.posts.map((post) => {
      const hoursOld = (Date.now() - post.timestamp) / (1000 * 60 * 60);
      const engagement = post.likes + post.comments * 2;
      const score = engagement / Math.pow(hoursOld + 1, 2);
      return { postId: post.id, score };
    });

    // Sort and take top 200
    scored.sort((a, b) => b.score - a.score);
    const topTrending = scored.slice(0, 200);

    // Store in Redis
    const pipeline = this.redis.pipeline();
    pipeline.del("trending_posts");
    pipeline.del("guest_feed");

    for (const item of topTrending) {
      pipeline.zadd("trending_posts", item.score, item.postId);
    }

    for (const item of topTrending.slice(0, 100)) {
      pipeline.zadd("guest_feed", item.score, item.postId);
    }

    pipeline.expire("trending_posts", 300);
    pipeline.expire("guest_feed", 300);

    await pipeline.exec();
    console.log(`   Created trending with ${topTrending.length} posts`);
  }

  private async verify() {
    console.log(`\n📊 Verification Report:`);

    // Check timeline sizes
    let totalTimelineSize = 0;
    for (const user of this.users.slice(0, 10)) {
      const size = await this.redis.zcard(`timeline:${user.id}`);
      totalTimelineSize += size;
    }
    console.log(
      `   Avg timeline size (sample): ${totalTimelineSize / 10} posts`
    );

    // Check trending
    const trendingSize = await this.redis.zcard("trending_posts");
    console.log(`   Trending posts: ${trendingSize}`);

    // Check guest feed
    const guestSize = await this.redis.zcard("guest_feed");
    console.log(`   Guest feed posts: ${guestSize}`);

    // Check celebrities
    const celebrityCount = await this.redis.scard("celebrities");
    console.log(`   Celebrity users: ${celebrityCount}`);

    if (celebrityCount > 0) {
      const celebs = await this.redis.smembers("celebrities");
      const outboxSize = await this.redis.zcard(`celebrity_posts:${celebs[0]}`);
      console.log(
        `   Sample celebrity outbox (${celebs[0].substring(0, 8)}...): ${outboxSize} posts`
      );
    }

    // Sample timeline read
    const sampleUser = this.users[0];
    const start = Date.now();
    const timeline = await this.redis.zrevrange(
      `timeline:${sampleUser.id}`,
      0,
      19,
      "WITHSCORES"
    );
    const readTime = Date.now() - start;
    console.log(
      `   Sample timeline read: ${timeline.length / 2} posts in ${readTime}ms`
    );
  }

  private getFollowers(userId: string): string[] {
    const followers: string[] = [];
    for (const [uid, connections] of this.connections) {
      if (connections.has(userId)) {
        followers.push(uid);
      }
    }
    return followers;
  }
}

// Run simulation
const simulator = new FeedLoadSimulator();
simulator.run().catch(console.error);
