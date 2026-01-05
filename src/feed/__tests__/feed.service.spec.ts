import { Test, TestingModule } from "@nestjs/testing";
import { FeedService } from "../feed.service";
import { FeedCacheService } from "../feed-cache.service";
import { TrendingService } from "../trending.service";
import { ConnectionsService } from "../../connections/connections.service";
import { LikesService } from "../../likes/likes.service";
import { Repository } from "typeorm";
import { Post, PostVisibility } from "../../posts/post.entity";
import { getRepositoryToken } from "@nestjs/typeorm";

/**
 * Feed Service Unit Tests
 *
 * Tests feed logic without external dependencies (Redis, DB)
 */
describe("FeedService Unit Tests", () => {
  let feedService: FeedService;
  let mockFeedCache: jest.Mocked<FeedCacheService>;
  let mockTrending: jest.Mocked<TrendingService>;
  let mockConnections: jest.Mocked<ConnectionsService>;
  let mockLikes: jest.Mocked<LikesService>;
  let mockPostRepo: jest.Mocked<Repository<Post>>;

  // Test data
  const testUserId = "user-123";
  const testConnectionIds = ["user-456", "user-789"];
  const testPosts = [
    createMockPost("post-1", "user-456", Date.now() - 1000),
    createMockPost("post-2", "user-789", Date.now() - 2000),
    createMockPost("post-3", "user-123", Date.now() - 3000),
  ];

  beforeEach(async () => {
    mockFeedCache = {
      getTimeline: jest.fn(),
      addToTimeline: jest.fn(),
      addToTimelines: jest.fn(),
      removeFromTimeline: jest.fn(),
      removeFromTimelines: jest.fn(),
      addToCelebrityPosts: jest.fn(),
      getCelebrityPosts: jest.fn(),
      filterCelebrities: jest.fn(),
      removeFromCelebrityPosts: jest.fn(),
      cachePost: jest.fn(),
      getCachedPosts: jest.fn(),
      invalidatePost: jest.fn(),
      getConnectionIds: jest.fn(),
      cacheConnectionIds: jest.fn(),
      invalidateConnectionIds: jest.fn(),
      getConnectionCount: jest.fn(),
      isAvailable: jest.fn().mockReturnValue(true),
    } as any;

    mockTrending = {
      getTrendingPosts: jest.fn(),
      getGuestFeed: jest.fn(),
      refreshTrendingPosts: jest.fn(),
      calculateTrendingScore: jest.fn(),
    } as any;

    mockConnections = {
      getConnectionUserIds: jest.fn(),
    } as any;

    mockLikes = {
      getLikeStatusForPosts: jest.fn(),
    } as any;

    mockPostRepo = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(testPosts),
      })),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: FeedCacheService, useValue: mockFeedCache },
        { provide: TrendingService, useValue: mockTrending },
        { provide: ConnectionsService, useValue: mockConnections },
        { provide: LikesService, useValue: mockLikes },
        { provide: getRepositoryToken(Post), useValue: mockPostRepo },
      ],
    }).compile();

    feedService = module.get<FeedService>(FeedService);
  });

  describe("getGuestFeed", () => {
    it("should return trending posts for guests", async () => {
      const trendingPosts = [
        { postId: "post-1", score: 10 },
        { postId: "post-2", score: 8 },
      ];

      mockTrending.getGuestFeed.mockResolvedValue({
        postIds: ["post-1", "post-2"],
        scores: [10, 8],
      });

      mockFeedCache.getCachedPosts.mockResolvedValue(
        new Map([
          ["post-1", testPosts[0]],
          ["post-2", testPosts[1]],
        ])
      );

      mockPostRepo.find.mockResolvedValue([]);

      const result = await feedService.getGuestFeed(undefined, 20);

      expect(mockTrending.getGuestFeed).toHaveBeenCalledWith(undefined, 21);
      expect(result.posts).toBeDefined();
    });

    it("should support cursor pagination", async () => {
      mockTrending.getGuestFeed.mockResolvedValue({
        postIds: ["post-3", "post-4"],
        scores: [5, 3],
      });

      mockFeedCache.getCachedPosts.mockResolvedValue(new Map());
      mockPostRepo.find.mockResolvedValue([]);

      const result = await feedService.getGuestFeed("10", 20);

      expect(mockTrending.getGuestFeed).toHaveBeenCalledWith("10", 21);
    });
  });

  describe("getFeed (authenticated)", () => {
    beforeEach(() => {
      mockFeedCache.getConnectionIds.mockResolvedValue(testConnectionIds);
      mockFeedCache.filterCelebrities.mockResolvedValue([]);
      mockFeedCache.getCelebrityPosts.mockResolvedValue([]);
      mockLikes.getLikeStatusForPosts.mockResolvedValue(new Map());
    });

    it("should blend connection posts with trending", async () => {
      // Timeline from cache
      mockFeedCache.getTimeline.mockResolvedValue({
        postIds: ["post-1", "post-2"],
        scores: [Date.now() - 1000, Date.now() - 2000],
      });

      // Trending
      mockTrending.getTrendingPosts.mockResolvedValue({
        postIds: ["post-trending-1"],
        scores: [50],
      });

      // Post hydration
      mockFeedCache.getCachedPosts.mockResolvedValue(
        new Map([
          ["post-1", testPosts[0]],
          ["post-2", testPosts[1]],
          [
            "post-trending-1",
            createMockPost("post-trending-1", "other-user", Date.now()),
          ],
        ])
      );

      mockPostRepo.find.mockResolvedValue([]);

      const result = await feedService.getFeed(testUserId, undefined, 20);

      expect(mockFeedCache.getTimeline).toHaveBeenCalled();
      expect(mockTrending.getTrendingPosts).toHaveBeenCalled();
      expect(result.posts).toBeDefined();
    });

    it("should rebuild timeline on cache miss", async () => {
      // Timeline cache miss
      mockFeedCache.getTimeline.mockResolvedValue(null);

      // Connection IDs cache miss - returns null to trigger DB fallback
      mockFeedCache.getConnectionIds.mockResolvedValue(null);

      // Trending
      mockTrending.getTrendingPosts.mockResolvedValue({
        postIds: [],
        scores: [],
      });

      // Connection service fallback when cache misses
      mockConnections.getConnectionUserIds.mockResolvedValue(testConnectionIds);

      // Post hydration from DB rebuild
      mockFeedCache.getCachedPosts.mockResolvedValue(new Map());
      mockPostRepo.find.mockResolvedValue(testPosts);

      const result = await feedService.getFeed(testUserId, undefined, 20);

      expect(mockConnections.getConnectionUserIds).toHaveBeenCalledWith(
        testUserId
      );
    });

    it("should merge celebrity posts at read time", async () => {
      // Timeline
      mockFeedCache.getTimeline.mockResolvedValue({
        postIds: ["post-1"],
        scores: [Date.now()],
      });

      // Has celebrity connections
      mockFeedCache.filterCelebrities.mockResolvedValue(["celeb-user"]);
      mockFeedCache.getCelebrityPosts.mockResolvedValue([
        { postId: "celeb-post", score: Date.now() },
      ]);

      // Trending
      mockTrending.getTrendingPosts.mockResolvedValue({
        postIds: [],
        scores: [],
      });

      // Post hydration
      mockFeedCache.getCachedPosts.mockResolvedValue(
        new Map([
          ["post-1", testPosts[0]],
          [
            "celeb-post",
            createMockPost("celeb-post", "celeb-user", Date.now()),
          ],
        ])
      );

      mockPostRepo.find.mockResolvedValue([]);

      const result = await feedService.getFeed(testUserId, undefined, 20);

      expect(mockFeedCache.filterCelebrities).toHaveBeenCalled();
      expect(mockFeedCache.getCelebrityPosts).toHaveBeenCalled();
    });
  });

  describe("warmCache", () => {
    it("should pre-populate timeline", async () => {
      mockFeedCache.getConnectionIds.mockResolvedValue(testConnectionIds);
      mockFeedCache.getTimeline.mockResolvedValue(null);
      mockConnections.getConnectionUserIds.mockResolvedValue(testConnectionIds);

      await feedService.warmCache(testUserId);

      expect(mockFeedCache.addToTimeline).toHaveBeenCalled();
    });
  });
});

// Helper to create mock posts
function createMockPost(id: string, authorId: string, timestamp: number): Post {
  return {
    id,
    authorId,
    content: `Test content for ${id}`,
    media: [],
    visibility: PostVisibility.PUBLIC,
    likeCount: Math.floor(Math.random() * 50),
    commentCount: Math.floor(Math.random() * 10),
    isDeleted: false,
    createdAt: new Date(timestamp),
    updatedAt: new Date(timestamp),
    author: {
      id: authorId,
      name: `User ${authorId}`,
      image: null,
    },
  } as any;
}
