import { Controller, Get, Query } from "@nestjs/common";
import { CollegeInfoService } from "../college-info/college-info.service";
import { CollegeWiseCourseService } from "../college-wise-course/college-wise-course.service";
import { ApiQuery } from "@nestjs/swagger";

@Controller("compare")
export class CompareController {
  constructor(
    private readonly collegeInfoService: CollegeInfoService,
    private readonly collegeWiseCourseService: CollegeWiseCourseService
  ) {}

  @Get()
  @ApiQuery({
    name: "college_id",
    type: Number,
    required: true,
    description: "ID of the college",
  })
  @ApiQuery({
    name: "course_id",
    type: Number,
    required: false,
    description: "ID of the course (optional)",
  })
  async compare(
    @Query("college_id") collegeId: string,
    @Query("course_id") courseId?: string
  ) {
    const id = Number(collegeId);
    const course_id = courseId ? Number(courseId) : undefined;
    if (isNaN(id)) {
      return { error: "Invalid college_id" };
    }
    if (courseId && isNaN(course_id)) {
      return { error: "Invalid course_id" };
    }
    const result =
      await this.collegeWiseCourseService.getCollegeBasicWithCourses(
        id,
        course_id
      );
    return result;
  }
}
