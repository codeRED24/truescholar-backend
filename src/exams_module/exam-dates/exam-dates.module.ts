import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExamDateService } from "./exam-dates.service";
import { ExamDateController } from "./exam-dates.controller";
import { ExamDate } from "./exam_dates.entity";
import { Exam } from "../exams/exams.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ExamDate, Exam])],
  controllers: [ExamDateController],
  providers: [ExamDateService],
  exports: [ExamDateService],
})
export class ExamDateModule {}
