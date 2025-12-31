import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { IEventBus, EVENT_BUS } from "../shared/events";
import { Follow } from "./follow.entity";
import { FollowCollege } from "./follow-college.entity";
import { FollowRepository } from "./follow.repository";
import { FollowCollegeRepository } from "./follow-college.repository";
import { DomainEvent } from "../shared/events/domain-event";
import {
  FollowEntry,
  FollowStats,
  FollowStatusResponse,
  FollowCollegeEntry,
} from "./follow.dto";

// Events
export class FollowCreatedEvent extends DomainEvent {
  readonly eventType = "follows.created";
  constructor(
    public readonly followId: string,
    public readonly followerId: string,
    public readonly followingId: string
  ) {
    super(followId);
  }
  protected getPayload() {
    return {
      followId: this.followId,
      followerId: this.followerId,
      followingId: this.followingId,
    };
  }
}

export class FollowRemovedEvent extends DomainEvent {
  readonly eventType = "follows.removed";
  constructor(
    public readonly followerId: string,
    public readonly followingId: string
  ) {
    super(`${followerId}-${followingId}`);
  }
  protected getPayload() {
    return {
      followerId: this.followerId,
      followingId: this.followingId,
    };
  }
}

export class CollegeFollowCreatedEvent extends DomainEvent {
  readonly eventType = "follows.college.created";
  constructor(
    public readonly followId: string,
    public readonly followerId: string,
    public readonly collegeId: number
  ) {
    super(followId);
  }
  protected getPayload() {
    return {
      followId: this.followId,
      followerId: this.followerId,
      collegeId: this.collegeId,
    };
  }
}

export class CollegeFollowRemovedEvent extends DomainEvent {
  readonly eventType = "follows.college.removed";
  constructor(
    public readonly followerId: string,
    public readonly collegeId: number
  ) {
    super(`${followerId}-college-${collegeId}`);
  }
  protected getPayload() {
    return {
      followerId: this.followerId,
      collegeId: this.collegeId,
    };
  }
}

@Injectable()
export class FollowersService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly followCollegeRepository: FollowCollegeRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

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
    await this.eventBus.publish(
      new FollowCreatedEvent(follow.id, followerId, followingId)
    );
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

    await this.eventBus.publish(
      new FollowRemovedEvent(followerId, followingId)
    );
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
    await this.eventBus.publish(
      new CollegeFollowCreatedEvent(follow.id, followerId, collegeId)
    );
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

    await this.eventBus.publish(
      new CollegeFollowRemovedEvent(followerId, collegeId)
    );
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
