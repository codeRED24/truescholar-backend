import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeWiseCourseService } from "./college-wise-course.service";
import { CollegeWiseCourseController } from "./college-wise-course.controller";
import { CollegeWiseCourse } from "./college_wise_course.entity";
import { CollegeInfo } from "../college-info/college-info.entity";
import { Course } from "../../courses_module/courses/courses.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { CollegeRanking } from "../college-ranking/college-ranking.entity";
import { CollegeWiseFees } from "../college-wise-fees/college-wise-fees.entity";
import { RankingAgency } from "../ranking-agency/ranking_agency.entity";
import { CollegeWisePlacement } from "../college-wise-placement/college-wise-placement.entity";
import { CollegeCutoff } from "../college-cutoff/college_cutoff.entity";
import { Specialization } from "../../specializations/specialization/specialization.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { Author } from "../../articles_modules/author/author.entity";
import { CollegeDates } from "../college-dates/college-dates.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollegeWiseCourse,
      CollegeInfo,
      Course,
      CourseGroup,
      CollegeRanking,
      CollegeWiseFees, 
      RankingAgency, 
      CollegeWisePlacement, 
      CollegeCutoff,
      Specialization,
      Stream,
      Author,
      CollegeDates
    ]),
  ],
  controllers: [CollegeWiseCourseController],
  providers: [CollegeWiseCourseService],
})
export class CollegeWiseCourseModule {}
