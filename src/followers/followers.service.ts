import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  OnModuleInit,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { KAFKA_SERVICE } from "../shared/kafka/kafka.module";
import { Follow } from "./follow.entity";
import { FollowCollege } from "./follow-college.entity";
import { FollowRepository } from "./follow.repository";
import { FollowCollegeRepository } from "./follow-college.repository";
import { FollowCacheService } from "./follow-cache.service";
import { randomUUID } from "crypto";
import { AuthorType } from "../common/enums";
import {
  FollowEntry,
  FollowStats,
  FollowStatusResponse,
  FollowCollegeEntry,
} from "./follow.dto";

@Injectable()
export class FollowersService implements OnModuleInit {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly followCollegeRepository: FollowCollegeRepository,
    private readonly followCacheService: FollowCacheService,
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async follow(
    followerId: string,
    followingId: string,
    authorType?: AuthorType,
    followerCollegeId?: number
  ): Promise<Follow> {
    if (followerId === followingId && authorType !== AuthorType.COLLEGE) {
      throw new BadRequestException("Cannot follow yourself");
    }

    const existing = await this.followRepository.findFollow(
      followerId,
      followingId,
      authorType,
      followerCollegeId
    );
    if (existing) {
      throw new ConflictException("Already following this user");
    }

    const follow = await this.followRepository.create(
      followerId,
      followingId,
      authorType,
      followerCollegeId
    );

    // Write-through cache update
    // Note: Cache service might need update to handle college follows if we want to cache them
    // For now, only caching user-user follows to avoid complexity
    if (!authorType || authorType === AuthorType.USER) {
      await this.followCacheService.addFollow(followerId, followingId);
    }

    this.kafkaClient.emit("social-graph.user.followed", {
      eventId: randomUUID(),
      eventType: "social-graph.user.followed",
      aggregateId: follow.id,
      occurredAt: new Date().toISOString(),
      payload: {
        followerId,
        followingId,
        authorType,
        followerCollegeId,
        followerFollowingCount: 0,
        followingFollowerCount: 0,
      },
    });

    return follow;
  }

  async unfollow(
    followerId: string,
    followingId: string,
    authorType?: AuthorType,
    followerCollegeId?: number
  ): Promise<void> {
    if (followerId === followingId && authorType !== AuthorType.COLLEGE) {
      throw new BadRequestException("Cannot unfollow yourself");
    }

    const deleted = await this.followRepository.delete(
      followerId,
      followingId,
      authorType,
      followerCollegeId
    );
    if (!deleted) {
      throw new NotFoundException("Not following this user");
    }

    // Write-through cache update
    if (!authorType || authorType === AuthorType.USER) {
      await this.followCacheService.removeFollow(followerId, followingId);
    }

    this.kafkaClient.emit("social-graph.user.unfollowed", {
      eventId: randomUUID(),
      eventType: "social-graph.user.unfollowed",
      aggregateId: `${followerId}-${followingId}`,
      occurredAt: new Date().toISOString(),
      payload: {
        followerId,
        followingId,
        authorType,
        followerCollegeId,
        followerFollowingCount: 0,
        followingFollowerCount: 0,
      },
    });
  }

  async followCollege(
    followerId: string,
    collegeId: number,
    authorType?: AuthorType,
    followerCollegeId?: number
  ): Promise<FollowCollege> {
    const existing = await this.followCollegeRepository.findFollow(
      followerId,
      collegeId,
      authorType,
      followerCollegeId
    );
    if (existing) {
      throw new ConflictException("Already following this college");
    }

    const follow = await this.followCollegeRepository.create(
      followerId,
      collegeId,
      authorType,
      followerCollegeId
    );

    this.kafkaClient.emit("social-graph.college.followed", {
      eventId: randomUUID(),
      eventType: "social-graph.college.followed",
      aggregateId: follow.id,
      occurredAt: new Date().toISOString(),
      payload: {
        userId: followerId,
        collegeId,
        authorType,
        followerCollegeId,
      },
    });

    return follow;
  }

  async unfollowCollege(
    followerId: string,
    collegeId: number,
    authorType?: AuthorType,
    followerCollegeId?: number
  ): Promise<void> {
    const deleted = await this.followCollegeRepository.delete(
      followerId,
      collegeId,
      authorType,
      followerCollegeId
    );
    if (!deleted) {
      throw new NotFoundException("Not following this college");
    }

    this.kafkaClient.emit("social-graph.college.unfollowed", {
      eventId: randomUUID(),
      eventType: "social-graph.college.unfollowed",
      aggregateId: `${followerId}-college-${collegeId}`,
      occurredAt: new Date().toISOString(),
      payload: {
        userId: followerId,
        collegeId,
        authorType,
        followerCollegeId,
      },
    });
  }

  async getFollowers(
    userId: string,
    page: number,
    limit: number
  ): Promise<FollowEntry[]> {
    return this.followRepository.getFollowers(userId, page, limit);
  }

  async getFollowing(
    userId: string,
    page: number,
    limit: number
  ): Promise<FollowEntry[]> {
    return this.followRepository.getFollowing(userId, page, limit);
  }

  async getFollowerCount(userId: string): Promise<number> {
    return this.followRepository.countFollowers(userId);
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.followRepository.countFollowing(userId);
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    return this.followRepository.getFollowingIds(userId);
  }

  async getFollowingColleges(
    userId: string,
    page: number,
    limit: number
  ): Promise<FollowCollegeEntry[]> {
    return this.followCollegeRepository.getFollowingColleges(
      userId,
      page,
      limit
    );
  }

  async getCollegeFollowers(
    collegeId: number,
    page: number,
    limit: number
  ): Promise<FollowEntry[]> {
    return this.followCollegeRepository.getFollowers(collegeId, page, limit);
  }

  async getFollowingCollegeIds(userId: string): Promise<number[]> {
    return this.followCollegeRepository.getFollowingCollegeIds(userId);
  }

  async getStats(
    userId: string
  ): Promise<FollowStats & { followingCollegesCount: number }> {
    const [followersCount, followingCount, followingCollegesCount] =
      await Promise.all([
        this.followRepository.countFollowers(userId),
        this.followRepository.countFollowing(userId),
        this.followCollegeRepository.countFollowing(userId),
      ]);
    return { followersCount, followingCount, followingCollegesCount };
  }

  async getCollegeStats(
    collegeId: number
  ): Promise<{ followersCount: number }> {
    const followersCount =
      await this.followCollegeRepository.countFollowers(collegeId);
    return { followersCount };
  }

  async getFollowStatus(
    userId: string,
    otherUserId: string
  ): Promise<FollowStatusResponse> {
    const [isFollowing, isFollowedBy] = await Promise.all([
      this.followRepository.isFollowing(userId, otherUserId),
      this.followRepository.isFollowing(otherUserId, userId),
    ]);
    return { isFollowing, isFollowedBy };
  }

  async getCollegeFollowStatus(
    userId: string,
    collegeId: number
  ): Promise<{ isFollowing: boolean }> {
    const isFollowing = await this.followCollegeRepository.isFollowing(
      userId,
      collegeId
    );
    return { isFollowing };
  }
}
