import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeInfoService } from "./college-info.service";
import { CollegeInfoController } from "./college-info.controller";
import { CollegeInfo } from "./college-info.entity";
import { CollegeContent } from "../college-content/college-content.entity";
import { City } from "../../helper_entities/cities/city.entity";
import { State } from "../../helper_entities/state/state.entity";
import { Country } from "../../helper_entities/country/country.entity";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Author } from "../../articles_modules/author/author.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { CollegeWiseCourse } from "../college-wise-course/college_wise_course.entity";
import { CollegeWiseFees } from "../college-wise-fees/college-wise-fees.entity";
import { CollegeWisePlacement } from "../college-wise-placement/college-wise-placement.entity";
import { CollegeRanking } from "../college-ranking/college-ranking.entity";
import { Facilities } from "../facilities/facilities.entity";
import { RankingAgency } from "../ranking-agency/ranking_agency.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { CollegeExam } from "../college_exam/college_exam.entity";
import { CollegeDates } from "../college-dates/college-dates.entity";
import { CollegeHostelCampus } from "../college-hostel-and-campus/college-hostel-and-campus.entity";
import { CollegeCutoff } from "../college-cutoff/college_cutoff.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollegeInfo,
      CollegeContent,
      City,
      State,
      Country,
      Author,
      Exam,
      Stream,
      CollegeWiseCourse,
      CollegeWiseFees,
      CollegeWisePlacement,
      CollegeRanking,
      Facilities,
      RankingAgency,
      CourseGroup,
      CollegeExam,
      CollegeDates,
      CollegeHostelCampus,
      CollegeCutoff,
    ]),
    ConfigModule,
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        node: process.env.ELASTICSEARCH_NODE,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        },
      }),
    }),
  ],
  controllers: [CollegeInfoController],
  providers: [CollegeInfoService],
  exports: [CollegeInfoService],
})
export class CollegeInfoModule implements OnModuleInit {
  constructor(private readonly collegeInfoService: CollegeInfoService) {}

  async onModuleInit() {}
}
