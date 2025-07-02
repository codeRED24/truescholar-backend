import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Exam } from "../../exams_module/exams/exams.entity";
import { ExamController } from "./exam.controller";
import { ExamService } from "./exam.service";
import { ExamContentCMSModule } from "./exam_content/exam_content.module";
import { LogsModule } from "../cms-logs/logs.module";
import { Logs } from "../cms-logs/logs.entity";
import { LogsService } from "../cms-logs/logs.service";
import { FileUploadService } from "../../utils/file-upload/fileUpload.service";
import { ExamDatesCMSModule } from "./exam_dates/exam_date.module";
import { CmsQuestionPaperModule } from "./question_papers/question_papers.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, Logs]),
    ExamContentCMSModule,
    LogsModule,
    ExamDatesCMSModule,
    CmsQuestionPaperModule,
  ],
  providers: [ExamService, LogsService, FileUploadService],
  controllers: [ExamController],
  exports: [TypeOrmModule],
})
export class CmsExamModule {}
