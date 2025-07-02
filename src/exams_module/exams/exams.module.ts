import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExamsService } from "./exams.service";
import { ExamsController } from "./exams.controller";
import { Exam } from "./exams.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { City } from "../../helper_entities/cities/city.entity";
import { ExamContent } from "../exam-content/exam_content.entity";
import { ExamDate } from "../exam-dates/exam_dates.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([Exam, Stream, City, ExamDate, ExamContent]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
})
export class ExamsModule {}
