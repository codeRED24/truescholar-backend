import { Module } from "@nestjs/common";
import { CollegeWiseCourseModule } from "../college-wise-course/college-wise-course.module";
import { CollegeInfoModule } from "../college-info/college-info.module";
import { CompareController } from "./compare.controller";

@Module({
  imports: [CollegeInfoModule, CollegeWiseCourseModule],
  controllers: [CompareController],
})
export class CompareModule {}
