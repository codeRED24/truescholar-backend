import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, Raw } from "typeorm";
import { Article } from "../articles_modules/articles/articles.entity";
import { CollegeContent } from "../college/college-content/college-content.entity";
import { ExamContent } from "../exams_module/exam-content/exam_content.entity";
import { ArticleType } from "../common/enums";
import { subDays } from "date-fns";

@Injectable()
export class SitemapRepository {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

    @InjectRepository(CollegeContent)
    private readonly collegeContentRepository: Repository<CollegeContent>,

    @InjectRepository(ExamContent)
    private readonly examContentRepository: Repository<ExamContent>
  ) {}

  /** Fetch recent news articles (for last 3 days) */

  async getRecentNews(): Promise<Article[]> {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
      return this.articleRepository.find({
        where: { 
          type: ArticleType.NEWS, 
          is_active: true, 
          updated_at: MoreThan(twoDaysAgo) 
        },
        order: { updated_at: "DESC" },
      });
  }
  

  async getUpdatedCollegeContent(): Promise<any[]> {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      return await this.collegeContentRepository
        .createQueryBuilder("college_content")
        .innerJoinAndSelect("college_content.college", "college_info") // Ensure relation exists
        .where("college_content.is_active = :is_active", { is_active: true })
        .andWhere("college_content.updated_at > :threeDaysAgo", {
          threeDaysAgo,
        })
        // .andWhere('college_content.silos IS NOT NULL AND college_content.silos <> \'\'') // Exclude empty silos
        .orderBy("college_content.updated_at", "DESC")
        .select([
          "college_info.college_id AS college_id", // Ensure correct alias
          "college_info.slug AS college_slug", // Fetch slug from college_info
          "college_content.silos AS silos", // Fetch silos from college_content
          "college_content.updated_at AS updated_at",
        ])
        .getRawMany();
    } catch (err) {
      console.error("❌ Error fetching college content:", err);
      return [];
    }
  }

  async getUpdatedExamContent(): Promise<any[]> {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      return await this.examContentRepository
        .createQueryBuilder("exam_content")
        .innerJoinAndSelect("exam_content.exam", "exam") // Join with Exam table
        .where("exam_content.is_active = :is_active", { is_active: true })
        .andWhere("exam_content.updated_at > :threeDaysAgo", { threeDaysAgo }) // Uncomment this line if needed
        // .andWhere('exam_content.silos IS NOT NULL AND exam_content.silos <> \'\'') // Exclude empty silos
        .orderBy("exam_content.updated_at", "DESC")
        .select([
          "exam.exam_id AS exam_id", // Use aliasing
          "exam.slug AS exam_slug",
          "exam.exam_name AS exam_name",
          "exam_content.silos AS silos",
          "exam_content.updated_at AS updated_at",
        ])
        .getRawMany();
    } catch (err) {
      console.error("❌ Error fetching exam content:", err);
      return [];
    }
  }

  /** Fetch paginated articles for sitemap-articles_X.xml */
 

  async getArticlesFromLast30Days(
    page: number,
    limit: number,
    type: ArticleType
  ): Promise<Article[]> {
    return this.articleRepository.find({
      where: {
        type,
        is_active: true,
        created_at: Raw((alias) => `${alias} >= NOW() - INTERVAL '30 days'`),
      },
      order: { updated_at: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getNewsFromLast30Days(
    page: number,
    limit: number,
    type: ArticleType
  ): Promise<Article[]> {
    return this.articleRepository.find({
      where: {
        type,
        is_active: true,
        created_at: Raw((alias) => `${alias} >= NOW() - INTERVAL '30 days'`),
      },
      order: { updated_at: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
  

  /** Count total articles (for pagination) */
  async countArticlesFromLast30Days(type: ArticleType): Promise<number> {
    return this.articleRepository.count({
      where: {
        type,
        is_active: true,
        created_at: Raw((alias) => `${alias} >= NOW() - INTERVAL '30 days'`),
      },
    });
  }
  

  /** Fetch paginated college content by silos */
  async getCollegeContentBySilos(
    silos: string,
    page: number,
    pageSize: number
  ): Promise<CollegeContent[]> {
    const date30DaysAgo = subDays(new Date(), 30);
    const offset = (page - 1) * pageSize;

    return this.collegeContentRepository
      .createQueryBuilder("collegeContent")
      .leftJoin("collegeContent.college", "collegeInfo")
      .addSelect("collegeInfo.slug")
      .andWhere("collegeContent.silos = :silos", { silos })
      .andWhere("collegeContent.updated_at >= :updated_at", {
        updated_at: date30DaysAgo,
      })
      .andWhere("collegeContent.is_active = :is_active", { is_active: true })
      .orderBy("collegeContent.updated_at", "DESC")
      .skip(offset) // Add pagination
      .take(pageSize) // Limit the number of results
      .getMany();
  }


  /** Count total college content by silos */
  async countCollegeContentBySilos(silos: string): Promise<number> {
    return this.collegeContentRepository.count({
      where: { silos, is_active: true },
    });
  }

  async getExamContentBySilos(
    silos: string,
    page: number,
    pageSize: number
  ): Promise<ExamContent[]> {
    const date30DaysAgo = subDays(new Date(), 30);
    const offset = (page - 1) * pageSize;
  
    return this.examContentRepository
      .createQueryBuilder("examContent")
      .leftJoin("examContent.exam", "exam") // Assuming relation exists
      .addSelect("exam.slug")
      .andWhere("examContent.silos = :silos", { silos })
      .andWhere("examContent.updated_at >= :updated_at", {
        updated_at: date30DaysAgo,
      })
      .andWhere("examContent.is_active = :is_active", { is_active: true })
      .orderBy("examContent.updated_at", "DESC")
      .skip(offset) // Add pagination
      .take(pageSize) // Limit the number of results
      .getMany();
  }


  /** Count total exam content by silos */
  async countExamContentBySilos(silos: string): Promise<number> {
    return this.examContentRepository.count({
      where: { silos, is_active: true },
    });
  }
}
