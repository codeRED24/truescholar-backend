import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseService } from "./courses.service";
import { CourseController } from "./courses.controller";
import { Course } from "./courses.entity";
import { Specialization } from "../../specializations/specialization/specialization.entity";
import { CourseGroup } from "../course-group/course_group.entity";
import { CourseContent } from "../../cms/course/course-content/course-content.entity";


@Module({
  imports: [TypeOrmModule.forFeature([Course, Specialization, CourseGroup,CourseContent]),
],
  providers: [CourseService,],
  controllers: [CourseController],
  exports: [TypeOrmModule],
})
export class CoursesModule {}
