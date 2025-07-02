import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HomePageController } from "./home-page.controller";
import { HomePageService } from "./home-page.service";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { Stream } from "../stream/stream.entity";
import { CollegeRanking } from "../../college/college-ranking/college-ranking.entity";
import { CollegeWiseCourse } from "../../college/college-wise-course/college_wise_course.entity";
import { City } from "../cities/city.entity";
import { State } from "../state/state.entity";
import { Course } from "../../courses_module/courses/courses.entity";
import { CollegeWiseFees } from "../../college/college-wise-fees/college-wise-fees.entity";
import { Article } from "../../articles_modules/articles/articles.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { AppService } from "../../app.service";
import { CollegeContent } from "../../college/college-content/college-content.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollegeInfo,
      Stream,
      State,
      City,
      CollegeRanking,
      CollegeWiseCourse,
      CollegeWiseFees,
      Course,
      Article,
      Exam,
      CourseGroup,
      CollegeContent,
    ]),
  ],
  controllers: [HomePageController],
  providers: [HomePageService, AppService],
})
export class HomePageModule {}
