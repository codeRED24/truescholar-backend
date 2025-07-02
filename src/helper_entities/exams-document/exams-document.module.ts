import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExamDocument } from "./exams-document.entity";
import { ExamDocumentService } from "./exams-document.service";
import { ExamDocumentController } from "./exams-document.controller";
import { Exam } from "../../exams_module/exams/exams.entity";
@Module({
  imports: [TypeOrmModule.forFeature([ExamDocument, Exam])],
  controllers: [ExamDocumentController],
  providers: [ExamDocumentService],
})
export class ExamDocumentModule {}
