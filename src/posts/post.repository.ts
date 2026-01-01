import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post, PostVisibility, PostMedia } from "./post.entity";
import { AuthorType, PostType } from "@/common/enums";

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>
  ) {}

  async create(data: {
    authorId: string;
    content: string;
    media?: PostMedia[];
    visibility?: PostVisibility;
    authorType?: AuthorType;
    type?: PostType;
    taggedCollegeId?: number;
  }): Promise<Post> {
    const post = this.repo.create({
      authorId: data.authorId,
      content: data.content,
      media: data.media || [],
      visibility: data.visibility || PostVisibility.PUBLIC,
      authorType: data.authorType || AuthorType.USER,
      type: data.type || PostType.GENERAL,
      taggedCollegeId: data.taggedCollegeId,
    });
    return this.repo.save(post);
  }

  async findById(id: string): Promise<Post | null> {
    return this.repo.findOne({ where: { id, isDeleted: false } });
  }

  async findByIdWithAuthor(id: string): Promise<Post | null> {
    return this.repo.findOne({
      where: { id, isDeleted: false },
      relations: ["author"],
    });
  }

  async getFeedForUser(
    userId: string,
    connectionIds: string[],
    page: number,
    limit: number
  ): Promise<Post[]> {
    const skip = (page - 1) * limit;
    const allAuthorIds = [userId, ...connectionIds];

    return this.repo
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.author", "author")
      .where("post.isDeleted = false")
      .andWhere(
        `(post.authorId IN (:...authorIds) OR post.visibility = :public)`,
        {
          authorIds: allAuthorIds.length > 0 ? allAuthorIds : [""],
          public: PostVisibility.PUBLIC,
        }
      )
      .orderBy("post.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getMany();
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        Post,
        "content" | "media" | "visibility" | "type" | "taggedCollegeId"
      >
    >
  ): Promise<Post | null> {
    const post = await this.findById(id);
    if (!post) return null;
    Object.assign(post, data);
    return this.repo.save(post);
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

  async incrementCommentCount(id: string): Promise<void> {
    await this.repo.increment({ id }, "commentCount", 1);
  }

  async decrementCommentCount(id: string): Promise<void> {
    await this.repo.decrement({ id }, "commentCount", 1);
  }
}
