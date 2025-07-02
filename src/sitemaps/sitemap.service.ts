import { Injectable } from "@nestjs/common";
import { join } from "path";
import { SitemapRepository } from "./sitemap.repository";
import {
  generateArticlesSitemap,
  generateNewsSitemap,
  generateSitemapIndex,
  generateUpdatesSitemap,
  generateCollegeContentSitemap,
  generateExamContentSitemap,
} from "./sitemap.utils";
import { ArticleType } from "../common/enums";

@Injectable()
export class SitemapService {
  private sitemapDirectory = join(process.cwd(), "public");
  private maxUrlsPerSitemap = 50000;

  constructor(private readonly sitemapRepository: SitemapRepository) {}

  async generateNewsSitemap(): Promise<string> {
    try {
      const newsList = await this.sitemapRepository.getRecentNews();
      return generateNewsSitemap(newsList);
    } catch (err) {
      console.error("❌ Error generating news sitemap:", err);
      return "";
    }
  }

  async generateUpdatesSitemap(): Promise<string> {
    try {
      const [collegeUpdates, examUpdates] = await Promise.all([
        this.sitemapRepository.getUpdatedCollegeContent(),
        this.sitemapRepository.getUpdatedExamContent(),
      ]);
      return generateUpdatesSitemap(collegeUpdates, examUpdates);
    } catch (err) {
      console.error("❌ Error generating updates sitemap:", err);
      return "";
    }
  }

  async generateArticleSitemaps(index: number): Promise<string> {
    const page = index + 1;
    const articles = await this.sitemapRepository.getArticlesFromLast30Days(
      page,
      this.maxUrlsPerSitemap,
      ArticleType.ARTICLE
    );
    // if (!articles.length) throw new Error("No articles found for the given index");
    return generateArticlesSitemap(articles);
  }

  async generateNewsSitemaps(index: number): Promise<string> {
    const page = index + 1;
    const articles = await this.sitemapRepository.getNewsFromLast30Days(
      page,
      this.maxUrlsPerSitemap,
      ArticleType.NEWS
    );
    // if (!articles.length) throw new Error("No articles found for the given index");
    return generateArticlesSitemap(articles);
  }

  async generateCollegeContentSitemaps(index: number, silos: string): Promise<string> {
    const page = index + 1;
    const collegeContent = await this.sitemapRepository.getCollegeContentBySilos(
      silos,
      page,
      this.maxUrlsPerSitemap
    );
    // if (!collegeContent.length) throw new Error(`No college content found for ${silos} at index ${index}`);
    return generateCollegeContentSitemap(collegeContent, silos);
  }

  async generateExamContentSitemaps(index: number, silos: string): Promise<string> {
    const page = index + 1;
    const examContent = await this.sitemapRepository.getExamContentBySilos(
      silos,
      page,
      this.maxUrlsPerSitemap
    );
    // if (!examContent.length) throw new Error(`No exam content found for ${silos} at index ${index}`);
    return generateExamContentSitemap(examContent, silos);
  }

  async generateSitemapIndex(): Promise<string> {
    const silos = {
      college: [
        "info", "highlights", "scholarship", "ranking", "facilities",
        "admission", "news", "fees", "faq", "cutoff", "placement", "courses"
      ],
      exam: [
        "highlights", "result", "application_process",
        "admit_card", "faq", "exam_pattern", "eligibility_criteria",
        "news", "cutoff", "info", "syllabus", "centers"
      ]
    };

    // Fetch total counts instead of full records
    const [totalArticles, totalNews, collegeContentCounts, examContentCounts] = await Promise.all([
      this.sitemapRepository.countArticlesFromLast30Days(ArticleType.ARTICLE),
      this.sitemapRepository.countArticlesFromLast30Days(ArticleType.NEWS),
      Promise.all(
        silos.college.map(async (type) => {
          const totalCount = await this.sitemapRepository.countCollegeContentBySilos(type);
          return {
            type,
            count: totalCount > 0 ? Math.ceil(totalCount / this.maxUrlsPerSitemap) : 0,
          };
        })
      ),
      Promise.all(
        silos.exam.map(async (type) => {
          const totalCount = await this.sitemapRepository.countExamContentBySilos(type);
          return {
            type,
            count: totalCount > 0 ? Math.ceil(totalCount / this.maxUrlsPerSitemap) : 0,
          };
        })
      )
    ]);

    return generateSitemapIndex(
      Math.ceil(totalArticles / this.maxUrlsPerSitemap),
      Math.ceil(totalNews / this.maxUrlsPerSitemap),
      collegeContentCounts,
      examContentCounts
    );
  }
}
