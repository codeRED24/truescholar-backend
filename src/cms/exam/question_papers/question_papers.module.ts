import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuestionPaperController } from "./question_papers.controller";
import { QuestionPaperService } from "./question_papers.service";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";
import { Logs } from "../../../cms/cms-logs/logs.entity";
import { ExamQuestionPapers } from "./question_papers.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ExamQuestionPapers, Logs])],
  providers: [QuestionPaperService, LogsService, FileUploadService],
  controllers: [QuestionPaperController],
  exports: [TypeOrmModule],
})
export class CmsQuestionPaperModule {}
