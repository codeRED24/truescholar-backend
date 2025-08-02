import { Controller, Get, Query } from "@nestjs/common";
import { CollegeInfoService } from "../college-info/college-info.service";
import { CollegeWiseCourseService } from "../college-wise-course/college-wise-course.service";

@Controller("compare")
export class CompareController {
  constructor(
    private readonly collegeInfoService: CollegeInfoService,
    private readonly collegeWiseCourseService: CollegeWiseCourseService
  ) {}

  @Get()
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
