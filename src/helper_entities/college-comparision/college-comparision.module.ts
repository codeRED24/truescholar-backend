import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeComparisionService } from "./college-comparision.service";
import { CollegeComparisionController } from "./college-comparision.controller";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { CollegeWiseFees } from "../../college/college-wise-fees/college-wise-fees.entity";
import { CollegeWisePlacement } from "../../college/college-wise-placement/college-wise-placement.entity";
import { CollegeWiseCourse } from "../../college/college-wise-course/college_wise_course.entity";
import { City } from "../../helper_entities/cities/city.entity";
import { CollegeExam } from "../../college/college_exam/college_exam.entity";
import { CollegeCutoff } from "../../college/college-cutoff/college_cutoff.entity";
import { CollegeDates } from "../../college/college-dates/college-dates.entity";
import { CollegeHostelCampus } from "../../college/college-hostel-and-campus/college-hostel-and-campus.entity";
import { CollegeScholarship } from "../../college/college-scholarship/college-scholarship.entity";
import { CollegeGallery } from "../../college/college-gallery/college-gallery.entity";
import { CollegeVideo } from "../../college/college-video/college-video.entity";
import { CollegeRanking } from "../../college/college-ranking/college-ranking.entity";
import { RankingAgency } from "../../college/ranking-agency/ranking_agency.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollegeInfo,
      City,
      CollegeWiseCourse,
      CollegeWiseFees,
      CollegeWisePlacement,
      CollegeExam,
      CollegeDates,
      CollegeCutoff,
      CollegeHostelCampus,
      CollegeScholarship,
      CollegeGallery,
      CollegeVideo,
      CollegeRanking,
      RankingAgency,
      CourseGroup,
    ]),
  ],
  providers: [CollegeComparisionService],
  controllers: [CollegeComparisionController],
})
export class CollegeComparisionModule {}
