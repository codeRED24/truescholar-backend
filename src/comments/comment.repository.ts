import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Comment } from "./comment.entity";

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly repo: Repository<Comment>
  ) {}

  async create(data: {
    postId: string;
    authorId: string;
    content: string;
    parentId?: string;
  }): Promise<Comment> {
    const comment = this.repo.create({
      postId: data.postId,
      authorId: data.authorId,
      content: data.content,
      parentId: data.parentId || null,
    });
    return this.repo.save(comment);
  }

  async findById(id: string): Promise<Comment | null> {
    return this.repo.findOne({ where: { id, isDeleted: false } });
  }

  async findByIdWithAuthor(id: string): Promise<Comment | null> {
    return this.repo.findOne({
      where: { id, isDeleted: false },
      relations: ["author"],
    });
  }

  async getPostComments(
    postId: string,
    page: number,
    limit: number
  ): Promise<Comment[]> {
    const skip = (page - 1) * limit;
    // Only return root-level comments (no parent)
    // Replies are loaded separately via getReplies
    return this.repo.find({
      where: { postId, parentId: IsNull(), isDeleted: false },
      relations: ["author"],
      order: { createdAt: "ASC" },
      skip,
      take: limit,
    });
  }

  async getReplies(
    parentId: string,
    page: number,
    limit: number
  ): Promise<Comment[]> {
    const skip = (page - 1) * limit;
    return this.repo.find({
      where: { parentId, isDeleted: false },
      relations: ["author"],
      order: { createdAt: "ASC" },
      skip,
      take: limit,
    });
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.repo.update(id, { isDeleted: true });
    return (result.affected ?? 0) > 0;
  }

  async incrementLikeCount(id: string): Promise<void> {
    await this.repo.increment({ id }, "likeCount", 1);
  }

  async decrementLikeCount(id: string): Promise<void> {
    await this.repo.decrement({ id }, "likeCount", 1);
  }

  async getReplyCount(parentId: string): Promise<number> {
    return this.repo.count({ where: { parentId, isDeleted: false } });
  }

  async getReplyCountsForComments(
    commentIds: string[]
  ): Promise<Map<string, number>> {
    if (commentIds.length === 0) return new Map();

    const results = await this.repo
      .createQueryBuilder("comment")
      .select("comment.parentId", "parentId")
      .addSelect("COUNT(*)", "count")
      .where("comment.parentId IN (:...ids)", { ids: commentIds })
      .andWhere("comment.isDeleted = false")
      .groupBy("comment.parentId")
      .getRawMany();

    const countsMap = new Map<string, number>();
    results.forEach((r) => countsMap.set(r.parentId, parseInt(r.count, 10)));
    return countsMap;
  }
}
