import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FollowCollege } from "./follow-college.entity";
import { FollowCollegeEntry } from "./follow.dto";

@Injectable()
export class FollowCollegeRepository {
  constructor(
    @InjectRepository(FollowCollege)
    private readonly repo: Repository<FollowCollege>
  ) {}

  async create(followerId: string, collegeId: number): Promise<FollowCollege> {
    const follow = this.repo.create({
      followerId,
      collegeId,
    });
    return this.repo.save(follow);
  }

  async delete(followerId: string, collegeId: number): Promise<boolean> {
    const result = await this.repo.delete({ followerId, collegeId });
    return (result.affected ?? 0) > 0;
  }

  async findFollow(
    followerId: string,
    collegeId: number
  ): Promise<FollowCollege | null> {
    return this.repo.findOne({
      where: { followerId, collegeId },
    });
  }

  async isFollowing(followerId: string, collegeId: number): Promise<boolean> {
    const follow = await this.findFollow(followerId, collegeId);
    return follow !== null;
  }

  async getFollowers(
    collegeId: number,
    page: number,
    limit: number
  ): Promise<any[]> {
    const skip = (page - 1) * limit;
    const follows = await this.repo
      .createQueryBuilder("follow")
      .leftJoinAndSelect("follow.follower", "follower")
      .where("follow.collegeId = :collegeId", { collegeId })
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

  async getFollowingColleges(
    userId: string,
    page: number,
    limit: number
  ): Promise<FollowCollegeEntry[]> {
    const skip = (page - 1) * limit;
    const follows = await this.repo
      .createQueryBuilder("follow")
      .leftJoinAndSelect("follow.college", "college")
      .where("follow.followerId = :userId", { userId })
      .orderBy("follow.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();

    return follows.map((f) => ({
      id: f.id,
      createdAt: f.createdAt,
      college: {
        college_id: f.college.college_id,
        college_name: f.college.college_name,
        logo_img: f.college.logo_img,
        slug: f.college.slug,
      },
    }));
  }

  async countFollowers(collegeId: number): Promise<number> {
    return this.repo.count({
      where: { collegeId },
    });
  }

  async countFollowing(userId: string): Promise<number> {
    return this.repo.count({
      where: { followerId: userId },
    });
  }

  async getFollowingCollegeIds(userId: string): Promise<number[]> {
    const follows = await this.repo.find({
      where: { followerId: userId },
      select: ["collegeId"],
    });
    return follows.map((f) => f.collegeId);
  }
}
