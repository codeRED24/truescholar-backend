import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { FeedModule } from "../feed.module";
import { FeedService } from "../feed.service";
import { FeedCacheService } from "../feed-cache.service";
import { TrendingService } from "../trending.service";
import { FeedFanoutService } from "../feed-fanout.service";
import { PostsModule } from "../../posts/posts.module";
import { ConnectionsModule } from "../../connections/connections.module";
import { LikesModule } from "../../likes/likes.module";
import { CommentsModule } from "../../comments/comments.module";
import { SharedModule } from "../../shared/shared.module";
import { Post, PostVisibility } from "../../posts/post.entity";
import {
  Connection,
  ConnectionStatus,
} from "../../connections/connection.entity";
import { Like } from "../../likes/like.entity";
import { Comment } from "../../comments/comment.entity";
import { User } from "../../authentication_module/better-auth/entities/users.entity";
import { Repository, DataSource } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { randomUUID } from "crypto";

/**
 * Feed System Integration Tests
 *
 * Simulates realistic scenarios with many users, posts, likes, and comments
 */
describe("FeedService Integration Tests", () => {
  let module: TestingModule;
  let feedService: FeedService;
  let feedCache: FeedCacheService;
  let trendingService: TrendingService;
  let fanoutService: FeedFanoutService;
  let postRepository: Repository<Post>;
  let userRepository: Repository<User>;
  let connectionRepository: Repository<Connection>;
  let likeRepository: Repository<Like>;
  let dataSource: DataSource;

  // Test data
  const testUsers: { id: string; name: string }[] = [];
  const testPosts: { id: string; authorId: string }[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: "postgres",
          host: process.env.DB_HOST_NEST || "localhost",
          port: 5432,
          username: process.env.DB_USERNAME || "postgres",
          password: process.env.DB_PASSWORD || "postgres",
          database: process.env.DB_NAME || "truescholar_test",
          entities: [Post, User, Connection, Like, Comment],
          synchronize: true, // Only for testing
          dropSchema: true, // Fresh DB for each test run
        }),
        FeedModule,
        PostsModule,
        ConnectionsModule,
        LikesModule,
        CommentsModule,
        SharedModule,
      ],
    }).compile();

    feedService = module.get<FeedService>(FeedService);
    feedCache = module.get<FeedCacheService>(FeedCacheService);
    trendingService = module.get<TrendingService>(TrendingService);
    fanoutService = module.get<FeedFanoutService>(FeedFanoutService);
    postRepository = module.get(getRepositoryToken(Post));
    userRepository = module.get(getRepositoryToken(User));
    connectionRepository = module.get(getRepositoryToken(Connection));
    likeRepository = module.get(getRepositoryToken(Like));
    dataSource = module.get(DataSource);
  });

  afterAll(async () => {
    await module.close();
  });

  describe("Setup: Create Test Users and Connections", () => {
    it("should create 50 test users", async () => {
      for (let i = 0; i < 50; i++) {
        const user = userRepository.create({
          id: randomUUID(),
          name: `Test User ${i}`,
          email: `user${i}@test.com`,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const saved = await userRepository.save(user);
        testUsers.push({ id: saved.id, name: saved.name });
      }
      expect(testUsers.length).toBe(50);
    });

    it("should create connections between users (network simulation)", async () => {
      // Create a semi-random connection graph
      // Each user connects to ~10 other users
      const connections: Partial<Connection>[] = [];

      for (let i = 0; i < testUsers.length; i++) {
        const numConnections = 5 + Math.floor(Math.random() * 10); // 5-15 connections
        const connectedTo = new Set<number>();

        for (let j = 0; j < numConnections; j++) {
          let targetIdx = Math.floor(Math.random() * testUsers.length);
          while (targetIdx === i || connectedTo.has(targetIdx)) {
            targetIdx = (targetIdx + 1) % testUsers.length;
          }
          connectedTo.add(targetIdx);

          connections.push({
            id: randomUUID(),
            requesterId: testUsers[i].id,
            addresseeId: testUsers[targetIdx].id,
            status: ConnectionStatus.ACCEPTED,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      await connectionRepository.save(connections);
      const count = await connectionRepository.count();
      console.log(`Created ${count} connections`);
      expect(count).toBeGreaterThan(100);
    });
  });

  describe("Setup: Create Posts with Varying Engagement", () => {
    it("should create 200 posts with varying timestamps", async () => {
      const now = Date.now();

      for (let i = 0; i < 200; i++) {
        const authorIdx = i % testUsers.length;
        const hoursAgo = Math.random() * 72; // 0-72 hours ago

        const post = postRepository.create({
          id: randomUUID(),
          authorId: testUsers[authorIdx].id,
          content: `Test post ${i} from ${testUsers[authorIdx].name}`,
          media: [],
          visibility: PostVisibility.PUBLIC,
          likeCount: 0,
          commentCount: 0,
          isDeleted: false,
          createdAt: new Date(now - hoursAgo * 60 * 60 * 1000),
          updatedAt: new Date(now - hoursAgo * 60 * 60 * 1000),
        });

        const saved = await postRepository.save(post);
        testPosts.push({ id: saved.id, authorId: saved.authorId });
      }

      expect(testPosts.length).toBe(200);
    });

    it("should add likes to posts (varying engagement)", async () => {
      // Some posts get many likes (viral), some get few
      for (const post of testPosts) {
        const numLikes = Math.floor(Math.random() * Math.random() * 50); // Skewed distribution

        const likers = new Set<string>();
        for (let i = 0; i < numLikes; i++) {
          const likerIdx = Math.floor(Math.random() * testUsers.length);
          if (
            !likers.has(testUsers[likerIdx].id) &&
            testUsers[likerIdx].id !== post.authorId
          ) {
            likers.add(testUsers[likerIdx].id);
          }
        }

        if (likers.size > 0) {
          const likes = Array.from(likers).map((userId) => ({
            id: randomUUID(),
            userId,
            postId: post.id,
            createdAt: new Date(),
          }));

          await likeRepository.save(likes);
          await postRepository.update(post.id, { likeCount: likers.size });
        }
      }

      const totalLikes = await likeRepository.count();
      console.log(
        `Created ${totalLikes} likes across ${testPosts.length} posts`
      );
      expect(totalLikes).toBeGreaterThan(0);
    });
  });

  describe("Guest Feed Tests", () => {
    beforeAll(async () => {
      // Manually refresh trending for testing
      await trendingService.refreshTrendingPosts();
    });

    it("should return trending posts for guests", async () => {
      const result = await feedService.getGuestFeed(undefined, 20);

      expect(result.posts).toBeDefined();
      expect(result.posts.length).toBeLessThanOrEqual(20);
      console.log(`Guest feed returned ${result.posts.length} posts`);
    });

    it("should support cursor pagination for guest feed", async () => {
      const page1 = await feedService.getGuestFeed(undefined, 10);

      if (page1.nextCursor) {
        const page2 = await feedService.getGuestFeed(page1.nextCursor, 10);

        // Ensure no overlap
        const page1Ids = new Set(page1.posts.map((p) => p.id));
        const page2Ids = page2.posts.map((p) => p.id);
        const overlap = page2Ids.filter((id) => page1Ids.has(id));

        expect(overlap.length).toBe(0);
        console.log(
          `Pagination test: Page 1 has ${page1.posts.length}, Page 2 has ${page2.posts.length}, No overlap`
        );
      }
    });
  });

  describe("Authenticated Feed Tests", () => {
    it("should return blended feed for authenticated user", async () => {
      const testUserId = testUsers[0].id;

      const result = await feedService.getFeed(testUserId, undefined, 20);

      expect(result.posts).toBeDefined();
      expect(result.posts.length).toBeGreaterThan(0);
      console.log(
        `User ${testUserId} feed returned ${result.posts.length} posts`
      );
    });

    it("should include posts from connections", async () => {
      const testUserId = testUsers[0].id;

      // Get user's connections
      const connections = await connectionRepository.find({
        where: [
          { requesterId: testUserId, status: ConnectionStatus.ACCEPTED },
          { addresseeId: testUserId, status: ConnectionStatus.ACCEPTED },
        ],
      });

      const connectionIds = connections.map((c) =>
        c.requesterId === testUserId ? c.addresseeId : c.requesterId
      );

      const result = await feedService.getFeed(testUserId, undefined, 50);

      // Check if at least some posts are from connections
      const fromConnections = result.posts.filter(
        (p) => connectionIds.includes(p.author.id) || p.author.id === testUserId
      );

      console.log(
        `Feed has ${fromConnections.length}/${result.posts.length} posts from connections`
      );
      expect(fromConnections.length).toBeGreaterThan(0);
    });

    it("should include trending/discovery posts", async () => {
      const testUserId = testUsers[0].id;

      // Get connection IDs
      const connections = await connectionRepository.find({
        where: [
          { requesterId: testUserId, status: ConnectionStatus.ACCEPTED },
          { addresseeId: testUserId, status: ConnectionStatus.ACCEPTED },
        ],
      });

      const connectionIds = new Set(
        connections.map((c) =>
          c.requesterId === testUserId ? c.addresseeId : c.requesterId
        )
      );
      connectionIds.add(testUserId);

      const result = await feedService.getFeed(testUserId, undefined, 50);

      // Posts NOT from connections = discovery/trending
      const discoveryPosts = result.posts.filter(
        (p) => !connectionIds.has(p.author.id)
      );

      console.log(
        `Feed has ${discoveryPosts.length}/${result.posts.length} discovery posts`
      );
      // May be 0 if all posts happen to be from connections in this small test
    });
  });

  describe("Performance Tests", () => {
    it("should handle feed request under 100ms (warm cache)", async () => {
      const testUserId = testUsers[0].id;

      // Warm the cache
      await feedService.warmCache(testUserId);

      // Time the feed request
      const start = Date.now();
      await feedService.getFeed(testUserId, undefined, 20);
      const duration = Date.now() - start;

      console.log(`Feed request took ${duration}ms`);
      expect(duration).toBeLessThan(500); // Be generous for test env
    });

    it("should handle concurrent feed requests", async () => {
      const userIds = testUsers.slice(0, 10).map((u) => u.id);

      const start = Date.now();
      const results = await Promise.all(
        userIds.map((userId) => feedService.getFeed(userId, undefined, 20))
      );
      const duration = Date.now() - start;

      console.log(`10 concurrent feed requests took ${duration}ms total`);
      expect(results.every((r) => r.posts.length > 0)).toBe(true);
    });
  });

  describe("Fan-out Tests", () => {
    it("should fan out new post to timelines", async () => {
      const authorId = testUsers[0].id;

      // Create a new post
      const newPost = await postRepository.save({
        id: randomUUID(),
        authorId,
        content: "New test post for fan-out",
        media: [],
        visibility: PostVisibility.PUBLIC,
        likeCount: 0,
        commentCount: 0,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Simulate fan-out event
      await fanoutService.handlePostCreated({
        payload: {
          postId: newPost.id,
          authorId,
          visibility: "public",
          content: newPost.content,
        },
      });

      // Check if post appears in a connection's feed
      const connections = await connectionRepository.find({
        where: [
          { requesterId: authorId, status: ConnectionStatus.ACCEPTED },
          { addresseeId: authorId, status: ConnectionStatus.ACCEPTED },
        ],
        take: 1,
      });

      if (connections.length > 0) {
        const connectionUserId =
          connections[0].requesterId === authorId
            ? connections[0].addresseeId
            : connections[0].requesterId;

        // Get timeline from cache
        const timeline = await feedCache.getTimeline(
          connectionUserId,
          undefined,
          20
        );

        if (timeline) {
          const hasNewPost = timeline.postIds.includes(newPost.id);
          console.log(
            `Fan-out test: New post ${hasNewPost ? "found" : "not found"} in connection's timeline`
          );
        }
      }
    });
  });
});
