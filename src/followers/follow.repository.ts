import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Follow } from "./follow.entity";
import { FollowEntry } from "./follow.dto";
import { AuthorType } from "../common/enums";

@Injectable()
export class FollowRepository {
  constructor(
    @InjectRepository(Follow)
    private readonly repo: Repository<Follow>
  ) {}

  async create(
    followerId: string,
    followingId: string,
    authorType: AuthorType = AuthorType.USER,
    followerCollegeId?: number
  ): Promise<Follow> {
    const follow = this.repo.create({
      followerId,
      followingId,
      authorType,
      followerCollegeId,
    });
    return this.repo.save(follow);
  }

  async delete(
    followerId: string,
    followingId: string,
    authorType: AuthorType = AuthorType.USER,
    followerCollegeId?: number
  ): Promise<boolean> {
    const where: any = { followerId, followingId, authorType };
    if (followerCollegeId) where.followerCollegeId = followerCollegeId;
    const result = await this.repo.delete(where);
    return (result.affected ?? 0) > 0;
  }

  async findFollow(
    followerId: string,
    followingId: string,
    authorType: AuthorType = AuthorType.USER,
    followerCollegeId?: number
  ): Promise<Follow | null> {
    const where: any = { followerId, followingId, authorType };
    if (followerCollegeId) where.followerCollegeId = followerCollegeId;
    return this.repo.findOne({ where });
  }

  async isFollowing(
    followerId: string,
    followingId: string,
    authorType: AuthorType = AuthorType.USER,
    followerCollegeId?: number
  ): Promise<boolean> {
    const follow = await this.findFollow(
      followerId,
      followingId,
      authorType,
      followerCollegeId
    );
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
      .leftJoinAndSelect("follow.followerCollege", "followerCollege")
      .where("follow.followingId = :userId", { userId })
      .orderBy("follow.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return follows.map((f) => {
      if (f.authorType === AuthorType.COLLEGE && f.followerCollege) {
        return {
          id: f.id,
          createdAt: f.createdAt,
          user: {
            id: f.followerCollege.college_id.toString(),
            name: f.followerCollege.college_name,
            image: f.followerCollege.logo_img,
            user_type: "college",
          },
        };
      }
      return {
        id: f.id,
        createdAt: f.createdAt,
        user: {
          id: f.follower.id,
          name: f.follower.name,
          image: f.follower.image,
          user_type: f.follower.user_type,
        },
      };
    });
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
      .andWhere("follow.authorType = :type", { type: AuthorType.USER })
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
      where: { followerId: userId, authorType: AuthorType.USER },
    });
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    const follows = await this.repo.find({
      where: { followerId: userId, authorType: AuthorType.USER },
      select: ["followingId"],
    });
    return follows.map((f) => f.followingId);
  }
}
