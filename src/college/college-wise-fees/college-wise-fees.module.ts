import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeWiseFeesService } from "./college-wise-fees.service";
import { CollegeWiseFeesController } from "./college-wise-fees.controller";
import { CollegeWiseFees } from "./college-wise-fees.entity";
import { CollegeInfo } from "../college-info/college-info.entity";
import { CollegeWiseCourse } from "../college-wise-course/college_wise_course.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollegeWiseFees,
      CollegeInfo,
      CollegeWiseCourse,
      CourseGroup,
    ]),
  ],
  controllers: [CollegeWiseFeesController],
  providers: [CollegeWiseFeesService],
  exports: [CollegeWiseFeesService],
})
export class CollegeWiseFeesModule {}
