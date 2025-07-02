import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeCutoffService } from "./college-cutoff.service";
import { CollegeCutoffController } from "./college-cutoff.controller";
import { CollegeCutoff } from "./college_cutoff.entity";
import { CollegeInfo } from "../college-info/college-info.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
import { CollegeWiseCourse } from "../college-wise-course/college_wise_course.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollegeCutoff,
      CollegeInfo,
      Exam,
      CollegeWiseCourse,
    ]),
  ],
  providers: [CollegeCutoffService],
  controllers: [CollegeCutoffController],
  exports: [TypeOrmModule],
})
export class CollegeCutoffModule {}
