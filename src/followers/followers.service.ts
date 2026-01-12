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
import { randomUUID } from "crypto";
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
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async follow(followerId: string, followingId: string): Promise<Follow> {
    if (followerId === followingId) {
      throw new BadRequestException("Cannot follow yourself");
    }

    const existing = await this.followRepository.findFollow(
      followerId,
      followingId
    );
    if (existing) {
      throw new ConflictException("Already following this user");
    }

    const follow = await this.followRepository.create(followerId, followingId);

    this.kafkaClient.emit("follows.created", {
      eventId: randomUUID(),
      eventType: "follows.created",
      aggregateId: follow.id,
      occurredAt: new Date().toISOString(),
      payload: {
        followId: follow.id,
        followerId,
        followingId,
      },
    });

    return follow;
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException("Cannot unfollow yourself");
    }

    const deleted = await this.followRepository.delete(followerId, followingId);
    if (!deleted) {
      throw new NotFoundException("Not following this user");
    }

    this.kafkaClient.emit("follows.removed", {
      eventId: randomUUID(),
      eventType: "follows.removed",
      aggregateId: `${followerId}-${followingId}`,
      occurredAt: new Date().toISOString(),
      payload: {
        followerId,
        followingId,
      },
    });
  }

  async followCollege(
    followerId: string,
    collegeId: number
  ): Promise<FollowCollege> {
    const existing = await this.followCollegeRepository.findFollow(
      followerId,
      collegeId
    );
    if (existing) {
      throw new ConflictException("Already following this college");
    }

    const follow = await this.followCollegeRepository.create(
      followerId,
      collegeId
    );

    this.kafkaClient.emit("follows.college.created", {
      eventId: randomUUID(),
      eventType: "follows.college.created",
      aggregateId: follow.id,
      occurredAt: new Date().toISOString(),
      payload: {
        followId: follow.id,
        followerId,
        collegeId,
      },
    });

    return follow;
  }

  async unfollowCollege(followerId: string, collegeId: number): Promise<void> {
    const deleted = await this.followCollegeRepository.delete(
      followerId,
      collegeId
    );
    if (!deleted) {
      throw new NotFoundException("Not following this college");
    }

    this.kafkaClient.emit("follows.college.removed", {
      eventId: randomUUID(),
      eventType: "follows.college.removed",
      aggregateId: `${followerId}-college-${collegeId}`,
      occurredAt: new Date().toISOString(),
      payload: {
        followerId,
        collegeId,
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
