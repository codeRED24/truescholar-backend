import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, QueryFailedError } from "typeorm";
import { Article } from "./articles.entity";
import { CreateArticleDto } from "./dto/create-articles.dto";
import { UpdateArticleDto } from "./dto/update-articles.dto";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { Author } from "../author/author.entity";
import { ExamContent } from "../../exams_module/exam-content/exam_content.entity";
import { CollegeContent } from "../../college/college-content/college-content.entity";
import { plainToInstance } from "class-transformer";
import { CollegeArticleContentDto } from "./dto/article-listing-response.dto";
import { ExamArticleContentDto } from "./dto/article-listing-response.dto";
import { ArticleListingDto } from "./dto/article-listing-response.dto";

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(CollegeContent)
    private readonly collegeContentRepository: Repository<CollegeContent>,
    @InjectRepository(ExamContent)
    private readonly examContentRepository: Repository<ExamContent>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>
  ) {}

  // Create Article
  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const { author_id } = createArticleDto;

    // Check if author exists
    if (author_id) {
      const author = await this.authorRepository.findOne({
        where: { author_id },
      });

      if (!author) {
        throw new NotFoundException(`Author with ID ${author_id} not found`);
      }
    }

    const article = this.articlesRepository.create(createArticleDto);

    try {
      return await this.articlesRepository.save(article);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new ConflictException("Custom ID must be unique");
      }
      throw error;
    }
  }

  // Get All Articles
  // async findAll(): Promise<Article[]> {
  //   return this.articlesRepository.find();
  // }

  async findAll(author_id?: number, page: number = 1, limit: number = 16, tag?: string): Promise<any> {
    const whereCondition: any = {
      ...(author_id ? { author_id } : {}),
    };
  
    
    if (tag) {
      whereCondition.tags = tag;  
    }
  
   
    limit = Math.max(1, limit); 
    const skip = (page - 1) * limit;
  
    const [articles, total] = await this.articlesRepository.findAndCount({
      where: whereCondition,
      take: limit,           
      skip: skip,           
      select: [
        'article_id',
        'created_at',
        'updated_at',
        'title',
        'slug',
        'read_time',
        'publication_date',
        'type',
        'tags',
        'img1_url',
      ], // 
      order: { updated_at: "DESC" },
    });
  
    return {
      data: articles,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      pageSize: limit,
    };
  }
  
  
  
  
  // Get Article by ID
  async findOne(id: number): Promise<Article> {
    const article = await this.articlesRepository
      .createQueryBuilder("article")
      .leftJoinAndSelect("article.author", "author") 
      .addSelect([
        "author.author_id",
        "author.author_name",
        "author.view_name",
        "author.image",
      ]) 
      .where("article.article_id = :id", { id })
      .getOne();
  
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  
    return article;
  }

  // Update Article
  async update(
    id: number,
    updateArticleDto: UpdateArticleDto
  ): Promise<{ message: string; data?: Article }> {
    const article = await this.findOne(id);
    const { author_id } = updateArticleDto;

    // Check if author exists
    if (author_id) {
      const author = await this.authorRepository.findOne({
        where: { author_id },
      });

      if (!author) {
        throw new NotFoundException(`Author with ID ${author_id} not found`);
      }
    }

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    Object.assign(article, updateArticleDto, { updated_at: new Date() });
    const updatedArticle = await this.articlesRepository.save(article);
    return {
      message: `Article with ID ${id} updated successfully`,
      data: updatedArticle,
    };
  }

  // Delete Article
  async delete(id: number): Promise<{ message: string }> {
    const result = await this.articlesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    return { message: `Article with ID ${id} deleted successfully` };
  }

  // Optimized article listing API
  async getArticleListing(): Promise<any> {
    try {
      const articles = await this.articlesRepository.find({
        order: { updated_at: "DESC" },
      });
        const collegeContent = await this.collegeContentRepository
        .createQueryBuilder("college_content")
        .where("college_content.silos = :silos", { silos: "news" })
        .select([
          "college_content.college_id",
          "college_content.title",
          "college_content.meta_desc",
          "college_content.img1_url",
          "college_content.img2_url",
          "college_content.author_id",
        ])
        .orderBy("college_content.updated_at", "DESC")
        .getMany();
      const examContent = await this.examContentRepository
        .createQueryBuilder("exam_content")
        .where("exam_content.silos = :silos", { silos: "news" })
        .select([
          "exam_content.exam_id",
          "exam_content.topic_title",
          "exam_content.meta_desc",
          "exam_content.img1_url",
          "exam_content.img2_url",
          "exam_content.author_id",
        ])
        .orderBy("exam_content.updated_at", "DESC")
        .getMany();

      return {
        basic_info: articles,
        college_content: plainToInstance(
          CollegeArticleContentDto,
          collegeContent
        ),
        exam_content: plainToInstance(ExamArticleContentDto, examContent),
      };
    } catch (error) {
      console.error("Error fetching article listing:", error);
      throw new Error("Failed to fetch article listing");
    }
  }
}
