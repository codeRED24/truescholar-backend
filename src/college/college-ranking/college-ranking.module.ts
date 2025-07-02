import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeRankingService } from "./college-ranking.service";
import { CollegeRankingController } from "./college-ranking.controller";
import { CollegeRanking } from "./college-ranking.entity";
import { CollegeInfo } from "../college-info/college-info.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollegeRanking,
      CollegeInfo,
      Stream,
      CourseGroup,
    ]),
  ],
  providers: [CollegeRankingService],
  controllers: [CollegeRankingController],
  exports: [TypeOrmModule],
})
export class CollegeRankingModule {}
