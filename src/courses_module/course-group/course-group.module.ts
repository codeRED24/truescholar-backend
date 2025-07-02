import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseGroupService } from "./course-group.service";
import { CourseGroupController } from "./course-group.controller";
import { CourseGroup } from "./course_group.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { CollegeWiseCourse } from "../../college/college-wise-course/college_wise_course.entity";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseGroup,
      Stream,
      CollegeInfo,
      CollegeWiseCourse,
    ]),
  ],
  providers: [CourseGroupService],
  controllers: [CourseGroupController],
})
export class CourseGroupModule {}
