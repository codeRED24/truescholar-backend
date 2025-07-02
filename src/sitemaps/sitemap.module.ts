import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Article } from "../articles_modules/articles/articles.entity";
import { SitemapService } from "./sitemap.service";
import { SitemapRepository } from "./sitemap.repository";
import { SitemapController } from "./sitemap.controller";
import { SitemapCron } from "./sitemap.cron";
import { CollegeContent } from "../college/college-content/college-content.entity";
import { ExamContent } from "../exams_module/exam-content/exam_content.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Article, CollegeContent, ExamContent])],
  controllers: [SitemapController],
  providers: [SitemapService, SitemapRepository, SitemapCron],
})
export class SitemapModule {}
