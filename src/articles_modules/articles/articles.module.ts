import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ArticlesService } from "./articles.service";
import { ArticlesController } from "./articles.controller";
import { Article } from "./articles.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { Author } from "../author/author.entity";
import { CollegeContent } from "../../college/college-content/college-content.entity";
import { ExamContent } from "../../exams_module/exam-content/exam_content.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article,
      Stream,
      Author,
      CollegeContent,
      ExamContent,
    ]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [TypeOrmModule],
})
export class ArticlesModule {}
