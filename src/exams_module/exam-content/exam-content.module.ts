import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExamContentService } from "./exam-content.service";
import { ExamContentController } from "./exam-content.controller";
import { ExamContent } from "./exam_content.entity";
import { Exam } from "../exams/exams.entity";
import { Author } from "../../articles_modules/author/author.entity";
@Module({
  imports: [TypeOrmModule.forFeature([ExamContent, Exam, Author])],
  controllers: [ExamContentController],
  providers: [ExamContentService],
})
export class ExamContentModule {}
