import { Module } from "@nestjs/common";
import { ExamDatesController } from "./exam_date.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Logs } from "../../../cms/cms-logs/logs.entity";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { LogsModule } from "../../../cms/cms-logs/logs.module";
import { ExamDate } from "../../../exams_module/exam-dates/exam_dates.entity";
import { ExamDatesService } from "./exam_date.service";

@Module({
  imports: [TypeOrmModule.forFeature([ExamDate, Logs]), LogsModule],
  controllers: [ExamDatesController],
  providers: [LogsService, ExamDatesService],
  exports: [TypeOrmModule],
})
export class ExamDatesCMSModule {}
