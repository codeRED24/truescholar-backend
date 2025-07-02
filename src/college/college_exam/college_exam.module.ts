import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeExamService } from "./college_exam.service";
import { CollegeExamController } from "./college_exam.controller";
import { CollegeExam } from "./college_exam.entity";
import { CollegeInfo } from "../college-info/college-info.entity";
import { Exam } from "../../exams_module/exams/exams.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CollegeExam, CollegeInfo, Exam])],
  providers: [CollegeExamService],
  controllers: [CollegeExamController],
  exports: [TypeOrmModule],
})
export class CollegeExamModule {}
