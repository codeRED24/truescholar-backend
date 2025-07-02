import { Module } from "@nestjs/common";
import { Course } from "../../courses_module/courses/courses.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseService } from "./course.service";
import { CourseController } from "./course.controller";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { StreamModule } from "../../helper_entities/stream/stream.module";
import { CmsCourseContentModule } from "./course-content/course-content.module";
import { CmsCourseGroupContentModule } from "./course-group-content/course-group-content.module";

@Module({
    imports: [
      TypeOrmModule.forFeature([Course, Stream]),
      StreamModule,
      CmsCourseContentModule,
      CmsCourseGroupContentModule,
    ],
    providers: [CourseService],
    controllers: [CourseController],
    exports: [TypeOrmModule],
  })
  export class CmsCourseModule {}