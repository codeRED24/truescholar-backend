import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, QueryFailedError } from "typeorm";
import { Author } from "./author.entity";
import { CreateAuthorDto } from "./dto/create-author.dto";
import { UpdateAuthorDto } from "./dto/update-author.dto";
import { CollegeContent } from "../../college/college-content/college-content.entity";
import { ExamContent } from "../../exams_module/exam-content/exam_content.entity";
import { Article } from "../articles/articles.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
import { CollegeInfo } from "../../college/college-info/college-info.entity";

export interface AuthorWithArticleCount extends Author {
  article_count: any;
}

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(CollegeContent)
    private readonly collegeContentRepository: Repository<CollegeContent>,
    @InjectRepository(ExamContent)
    private readonly examContentRepository: Repository<ExamContent>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>
  ) {}

  // GET ALL
  async findAll(author_name?: string): Promise<Author[]> {
    if (author_name) {
      return this.authorRepository.find({
        where: {
          author_name: Like(`%${author_name}%`),
        },
      });
    }
    return this.authorRepository.find();
  }

  // GET /authors/:id
  async findOne(id: number): Promise<AuthorWithArticleCount> {
    const author = await this.authorRepository.findOne({
      where: { author_id: id, is_active: true },
    });
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    // Parallelize count queries for optimization
    const [articleCount, collegeContentCount, examContentCount] =
      await Promise.all([
        this.articleRepository.count({
          where: { author_id: id, is_active: true },
        }),
        this.collegeContentRepository.count({
          where: { author_id: id, is_active: true },
        }),
        this.examContentRepository.count({
          where: { author_id: id, is_active: true },
        }),
      ]);
    const totalCount = articleCount + collegeContentCount + examContentCount;

    // Add article_count to author object and return
    return {
      ...author,
      article_count: {
        article: articleCount,
        college: collegeContentCount,
        exam: examContentCount,
      },
    };
  }

  // POST
  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepository.create(createAuthorDto);
    try {
      return await this.authorRepository.save(author);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Author ID must be unique");
      }
      throw error;
    }
  }

  // PATCH /authors/:id
  async update(
    id: number,
    updateAuthorDto: UpdateAuthorDto
  ): Promise<{ message: string; data?: Author }> {
    const author = await this.findOne(id);
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    await this.authorRepository.update(id, updateAuthorDto);
    const updatedAuthor = await this.findOne(id);
    return {
      message: `Author with ID ${id} updated successfully`,
      data: updatedAuthor,
    };
  }

  // DELETE /authors/:id
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.authorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    return { message: `Author with ID ${id} deleted successfully` };
  }

  async getAuthorTabData(
    authorId: number,
    type: "articles" | "exams" | "colleges",
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    const author = await this.authorRepository.findOne({
      where: { author_id: authorId, is_active: true },
      select: ["author_id"],
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${authorId} not found`);
    }

    const offset = (page - 1) * limit;

    if (type === "colleges") {
      const [collegeContent, total] = await this.collegeContentRepository
        .createQueryBuilder("collegeContent")
        .leftJoinAndSelect("collegeContent.college", "college_info")
        .where("collegeContent.author_id = :authorId", { authorId })
        .select([
          "collegeContent.updated_at",
          "collegeContent.img1_url",
          "collegeContent.college_content_id",
          "collegeContent.meta_desc",
          "collegeContent.title",
          "college_info.college_id",
          "college_info.college_name",
          "college_info.slug",
          "collegeContent.silos",
        ])
        .orderBy("collegeContent.updated_at", "DESC")
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      // Standardize format
      const formattedData = collegeContent.map((item) => ({
        id: item.college_content_id,
        title: item.title || item.college?.college_name || "College Content",
        meta_desc: item.meta_desc,
        img1_url: item.img1_url,
        updated_at: item.updated_at,
        category: "college",
        slug: item.college?.slug,
        entity_id: item.college?.college_id,
        entity_name: item.college?.college_name,
        silos: item.silos,
      }));

      return {
        type,
        data: formattedData,
        total,
        page,
        limit,
        hasMore: page * limit < total,
      };
    }

    if (type === "exams") {
      const [examContent, total] = await this.examContentRepository
        .createQueryBuilder("examContent")
        .leftJoinAndSelect("examContent.exam", "exam")
        .where("examContent.author_id = :authorId", { authorId })
        .select([
          "examContent.updated_at",
          "examContent.img1_url",
          "examContent.exam_content_id",
          "examContent.meta_desc",
          "examContent.topic_title",
          "exam.exam_id",
          "exam.exam_name",
          "exam.slug",
          "exam.exam_id",
          "examContent.silos",
        ])
        .orderBy("examContent.updated_at", "DESC")
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      // Standardize format
      const formattedData = examContent.map((item) => ({
        id: item.exam?.exam_id,
        title: item.topic_title || item.exam?.exam_name || "Exam Content",
        meta_desc: item.meta_desc,
        img1_url: item.img1_url,
        updated_at: item.updated_at,
        category: "exam",
        slug: item.exam?.exam_name,
        entity_id: item.exam?.exam_id,
        entity_name: item.exam?.exam_name,
        silos: item.silos,
      }));

      return {
        type,
        data: formattedData,
        total,
        page,
        limit,
        hasMore: page * limit < total,
      };
    }

    if (type === "articles") {
      const [articles, total] = await this.articleRepository
        .createQueryBuilder("article")
        .where("article.author_id = :authorId", { authorId })
        .andWhere("article.is_active = :isActive", { isActive: true })
        .select([
          "article.updated_at",
          "article.img1_url",
          "article.article_id",
          "article.meta_desc",
          "article.title",
          "article.slug",
        ])
        .orderBy("article.updated_at", "DESC")
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      // Standardize format
      const formattedData = articles.map((item) => ({
        id: item.article_id,
        title: item.title || "Article",
        meta_desc: item.meta_desc,
        img1_url: item.img1_url,
        updated_at: item.updated_at,
        category: "article",
        slug: item.slug,
        entity_id: item.article_id,
        entity_name: item.title,
      }));

      return {
        type,
        data: formattedData,
        total,
        page,
        limit,
        hasMore: page * limit < total,
      };
    }

    throw new BadRequestException(
      "Invalid type. Must be 'articles', 'exams', or 'colleges'."
    );
  }
}
