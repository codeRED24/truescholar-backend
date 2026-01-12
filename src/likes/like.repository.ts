import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Like } from "./like.entity";

@Injectable()
export class LikeRepository {
  constructor(
    @InjectRepository(Like)
    private readonly repo: Repository<Like>
  ) {}

  async likePost(userId: string, postId: string): Promise<Like> {
    const like = this.repo.create({ userId, postId, commentId: null });
    return this.repo.save(like);
  }

  async likeComment(userId: string, commentId: string): Promise<Like> {
    const like = this.repo.create({ userId, postId: null, commentId });
    return this.repo.save(like);
  }

  async unlikePost(userId: string, postId: string): Promise<boolean> {
    const result = await this.repo.delete({ userId, postId });
    return (result.affected ?? 0) > 0;
  }

  async unlikeComment(userId: string, commentId: string): Promise<boolean> {
    const result = await this.repo.delete({ userId, commentId });
    return (result.affected ?? 0) > 0;
  }

  async hasLikedPost(userId: string, postId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { userId, postId } });
    return count > 0;
  }

  async hasLikedComment(userId: string, commentId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { userId, commentId } });
    return count > 0;
  }

  async getLikeStatusForPosts(
    userId: string,
    postIds: string[]
  ): Promise<Map<string, boolean>> {
    if (postIds.length === 0) return new Map();
    const likes = await this.repo.find({
      where: { userId, postId: In(postIds) },
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
    commentIds: string[]
  ): Promise<Map<string, boolean>> {
    if (commentIds.length === 0) return new Map();
    const likes = await this.repo.find({
      where: { userId, commentId: In(commentIds) },
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
