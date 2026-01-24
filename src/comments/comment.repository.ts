import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Brackets } from "typeorm";
import { Comment } from "./comment.entity";
import { AuthorType } from "../common/enums";

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
    authorType?: AuthorType;
    collegeId?: number;
  }): Promise<Comment> {
    const comment = this.repo.create({
      postId: data.postId,
      authorId: data.authorId,
      content: data.content,
      parentId: data.parentId || null,
      authorType: data.authorType || AuthorType.USER,
      collegeId: data.collegeId || null,
    });
    return this.repo.save(comment);
  }

  async findById(id: string): Promise<Comment | null> {
    return this.repo.findOne({ where: { id, isDeleted: false } });
  }

  async findByIdWithAuthor(id: string): Promise<Comment | null> {
    return this.repo.findOne({
      where: { id, isDeleted: false },
      relations: ["author", "college"],
    });
  }

  async getPostComments(
    postId: string,
    page: number,
    limit: number,
    cursor?: string
  ): Promise<Comment[]> {
    const queryBuilder = this.repo
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.author", "author")
      .leftJoinAndSelect("comment.college", "college")
      .where("comment.postId = :postId", { postId })
      .andWhere("comment.parentId IS NULL")
      .andWhere("comment.isDeleted = :isDeleted", { isDeleted: false });

    if (cursor) {
      // Cursor format: "timestamp_id"
      const [dateStr, id] = cursor.split("_");
      const date = new Date(dateStr);

      if (!isNaN(date.getTime()) && id) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where("date_trunc('milliseconds', comment.createdAt) > :date", {
              date,
            }).orWhere(
              "date_trunc('milliseconds', comment.createdAt) = :date AND comment.id > :id",
              { date, id }
            );
          })
        );
      }
    } else {
      queryBuilder.skip((page - 1) * limit);
    }

    return queryBuilder
      .orderBy("comment.createdAt", "ASC")
      .addOrderBy("comment.id", "ASC")
      .take(limit)
      .getMany();
  }

  async getReplies(
    parentId: string,
    page: number,
    limit: number
  ): Promise<Comment[]> {
    const skip = (page - 1) * limit;
    return this.repo.find({
      where: { parentId, isDeleted: false },
      relations: ["author", "college"],
      order: { createdAt: "ASC", id: "ASC" },
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
