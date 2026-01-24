import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, IsNull } from "typeorm";
import { Like } from "./like.entity";
import { AuthorType } from "../common/enums";

@Injectable()
export class LikeRepository {
  constructor(
    @InjectRepository(Like)
    private readonly repo: Repository<Like>
  ) {}

  async likePost(
    userId: string,
    postId: string,
    authorType: AuthorType = AuthorType.USER,
    collegeId?: number
  ): Promise<Like> {
    const like = this.repo.create({
      userId,
      postId,
      commentId: null,
      authorType,
      collegeId: collegeId || null,
    });
    return this.repo.save(like);
  }

  async likeComment(
    userId: string,
    commentId: string,
    authorType: AuthorType = AuthorType.USER,
    collegeId?: number
  ): Promise<Like> {
    const like = this.repo.create({
      userId,
      postId: null,
      commentId,
      authorType,
      collegeId: collegeId || null,
    });
    return this.repo.save(like);
  }

  async unlikePost(
    userId: string,
    postId: string,
    authorType: AuthorType = AuthorType.USER,
    collegeId?: number
  ): Promise<boolean> {
    const whereCondition: any = {
      userId,
      postId,
      authorType,
    };

    if (authorType === AuthorType.COLLEGE && collegeId) {
      whereCondition.collegeId = collegeId;
    } else {
      whereCondition.collegeId = IsNull();
    }

    const result = await this.repo.delete(whereCondition);
    return (result.affected ?? 0) > 0;
  }

  async unlikeComment(
    userId: string,
    commentId: string,
    authorType: AuthorType = AuthorType.USER,
    collegeId?: number
  ): Promise<boolean> {
    const whereCondition: any = {
      userId,
      commentId,
      authorType,
    };

    if (authorType === AuthorType.COLLEGE && collegeId) {
      whereCondition.collegeId = collegeId;
    } else {
      whereCondition.collegeId = IsNull();
    }

    const result = await this.repo.delete(whereCondition);
    return (result.affected ?? 0) > 0;
  }

  async hasLikedPost(
    userId: string,
    postId: string,
    authorType: AuthorType = AuthorType.USER,
    collegeId?: number
  ): Promise<boolean> {
    const whereCondition: any = {
      userId,
      postId,
      authorType,
    };

    if (authorType === AuthorType.COLLEGE && collegeId) {
      whereCondition.collegeId = collegeId;
    } else {
      whereCondition.collegeId = IsNull();
    }

    const count = await this.repo.count({ where: whereCondition });
    return count > 0;
  }

  async hasLikedComment(
    userId: string,
    commentId: string,
    authorType: AuthorType = AuthorType.USER,
    collegeId?: number
  ): Promise<boolean> {
    const whereCondition: any = {
      userId,
      commentId,
      authorType,
    };

    if (authorType === AuthorType.COLLEGE && collegeId) {
      whereCondition.collegeId = collegeId;
    } else {
      whereCondition.collegeId = IsNull();
    }

    const count = await this.repo.count({ where: whereCondition });
    return count > 0;
  }

  async getLikeStatusForPosts(
    userId: string,
    postIds: string[],
    authorType: AuthorType = AuthorType.USER,
    collegeId?: number
  ): Promise<Map<string, boolean>> {
    if (postIds.length === 0) return new Map();

    const whereCondition: any = {
      userId,
      postId: In(postIds),
      authorType,
    };

    if (authorType === AuthorType.COLLEGE && collegeId) {
      whereCondition.collegeId = collegeId;
    } else {
      whereCondition.collegeId = IsNull();
    }

    const likes = await this.repo.find({
      where: whereCondition,
      select: ["postId"],
    });

    const likedPostIds = new Set(likes.map((l) => l.postId));
    const result = new Map<string, boolean>();
    for (const postId of postIds) {
      result.set(postId, likedPostIds.has(postId));
    }
    return result;
  }

  async getLikeStatusForComments(
    userId: string,
    commentIds: string[],
    authorType: AuthorType = AuthorType.USER,
    collegeId?: number
  ): Promise<Map<string, boolean>> {
    if (commentIds.length === 0) return new Map();

    const whereCondition: any = {
      userId,
      commentId: In(commentIds),
      authorType,
    };

    if (authorType === AuthorType.COLLEGE && collegeId) {
      whereCondition.collegeId = collegeId;
    } else {
      whereCondition.collegeId = IsNull();
    }

    const likes = await this.repo.find({
      where: whereCondition,
      select: ["commentId"],
    });

    const likedCommentIds = new Set(likes.map((l) => l.commentId));
    const result = new Map<string, boolean>();
    for (const commentId of commentIds) {
      result.set(commentId, likedCommentIds.has(commentId));
    }
    return result;
  }
}
