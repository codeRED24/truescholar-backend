import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Follow } from "./follow.entity";
import { FollowEntry } from "./follow.dto";

@Injectable()
export class FollowRepository {
  constructor(
    @InjectRepository(Follow)
    private readonly repo: Repository<Follow>
  ) {}

  async create(followerId: string, followingId: string): Promise<Follow> {
    const follow = this.repo.create({
      followerId,
      followingId,
    });
    return this.repo.save(follow);
  }

  async delete(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.repo.delete({ followerId, followingId });
    return (result.affected ?? 0) > 0;
  }

  async findFollow(
    followerId: string,
    followingId: string
  ): Promise<Follow | null> {
    return this.repo.findOne({
      where: { followerId, followingId },
    });
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.findFollow(followerId, followingId);
    return follow !== null;
  }

  async getFollowers(
    userId: string,
    page: number,
    limit: number
  ): Promise<FollowEntry[]> {
    const skip = (page - 1) * limit;
    const follows = await this.repo
      .createQueryBuilder("follow")
      .leftJoinAndSelect("follow.follower", "follower")
      .where("follow.followingId = :userId", { userId })
      .orderBy("follow.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return follows.map((f) => ({
      id: f.id,
      createdAt: f.createdAt,
      user: {
        id: f.follower.id,
        name: f.follower.name,
        image: f.follower.image,
        user_type: f.follower.user_type,
      },
    }));
  }

  async getFollowing(
    userId: string,
    page: number,
    limit: number
  ): Promise<FollowEntry[]> {
    const skip = (page - 1) * limit;
    const follows = await this.repo
      .createQueryBuilder("follow")
      .leftJoinAndSelect("follow.following", "following")
      .where("follow.followerId = :userId", { userId })
      .orderBy("follow.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return follows.map((f) => ({
      id: f.id,
      createdAt: f.createdAt,
      user: {
        id: f.following.id,
        name: f.following.name,
        image: f.following.image,
        user_type: f.following.user_type,
      },
    }));
  }

  async countFollowers(userId: string): Promise<number> {
    return this.repo.count({
      where: { followingId: userId },
    });
  }

  async countFollowing(userId: string): Promise<number> {
    return this.repo.count({
      where: { followerId: userId },
    });
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    const follows = await this.repo.find({
      where: { followerId: userId },
      select: ["followingId"],
    });
    return follows.map((f) => f.followingId);
  }
}
