import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
  Put
} from "@nestjs/common";
import { CollegeWiseCourseService } from "./college-wise-course.service";
import { CreateCollegeWiseCourseDto } from "./dto/create-college_wise_course.dto";
import { UpdateCollegeWiseCourseDto } from "./dto/update-college_wise_course.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";
import { CreateCollegeWiseCoursesDto } from "../../college/college-wise-course/dto/create-college_wise_courses.dto";
import { UpdateSingleCourseDto } from "./dto/update-course.dto";

@ApiTags("college_wise_course")
@Controller("college_wise_course")
// @UseGuards(JwtAuthGuard)
export class CollegeWiseCourseController {
  constructor(
    private readonly collegeWiseCourseService: CollegeWiseCourseService
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all college-wise courses" })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Name of the course",
  })
  @ApiResponse({ status: 200, description: "List of college-wise courses." })
  findAll(@Query("name") name?: string) {
    return this.collegeWiseCourseService.findAll(name);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a college-wise course by ID" })
  @ApiResponse({ status: 200, description: "College-wise course details." })
  @ApiResponse({ status: 404, description: "College-wise course not found." })
  findOne(@Param("id") id: number) {
    return this.collegeWiseCourseService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new college-wise course" })
  @ApiResponse({
    status: 201,
    description: "College-wise course created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(
    @Body(ValidationPipe)
    createCollegeWiseCourseDto: CreateCollegeWiseCourseDto
  ) {
    return this.collegeWiseCourseService.create(createCollegeWiseCourseDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a college-wise course" })
  @ApiResponse({
    status: 200,
    description: "College-wise course updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College-wise course not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe)
    updateCollegeWiseCourseDto: UpdateCollegeWiseCourseDto
  ) {
    return this.collegeWiseCourseService.update(id, updateCollegeWiseCourseDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a college-wise course" })
  @ApiResponse({
    status: 200,
    description: "College-wise course deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College-wise course not found." })
  delete(@Param("id") id: number) {
    return this.collegeWiseCourseService.delete(id);
  }

  // Get the college_content data by using college_id and optionally course_id
  @Get("all")
  @ApiOperation({
    summary: "Get college-wise course by College ID and optional Course ID",
  })
  @ApiQuery({
    name: "cid",
    required: true,
    description: "College ID to fetch related college-wise courses",
  })
  @ApiQuery({
    name: "course_id",
    required: false,
    description: "Optional Course ID to fetch related courses",
  })
  @ApiResponse({ status: 200, description: "List of college content." })
  async findByCollegeId(
    @Query("cid", ParseIntPipe) collegeId: number,
    @Query("course_id", ParseIntPipe)
    courseId?: number
  ) {
    return this.collegeWiseCourseService.findByCollegeId(collegeId, courseId);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Create multiple college-wise courses in bulk" })
  @ApiResponse({
    status: 201,
    description: "College-wise courses created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  createBulk(
    @Body(ValidationPipe)
    createCollegeWiseCoursesDto: CreateCollegeWiseCourseDto[]
  ) {
    return this.collegeWiseCourseService.createBulk(
      createCollegeWiseCoursesDto
    );
  }

  @Get("course-details/:id")
@ApiOperation({ summary: "Get detailed course information by ID" })
@ApiResponse({ status: 200, description: "Course details fetched successfully." })
@ApiResponse({ status: 404, description: "Course or related data not found." })
async getCourseDetails(@Param("id", ParseIntPipe) id: number) {
  return this.collegeWiseCourseService.getCourseDetails(id);
}

@Get("details")
@ApiOperation({ summary: "Get detailed college-wise course information" })
@ApiResponse({
  status: 200,
  description: "Detailed college-wise course information with filters.",
})
findAllWithDetails() {
  return this.collegeWiseCourseService.findAllWithDetails();
}

@Post("add")
async add(@Body() dto: CreateCollegeWiseCoursesDto) {
  return this.collegeWiseCourseService.createCollegeWiseCourse(dto);
}

@Get("/courses/:college_id")
@ApiOperation({ summary: "Get paginated list of courses with details" })
async getCourses(
  @Query("page") page: number = 1,
  @Query("limit") limit: number = 10,
  @Param("college_id") college_id: number
) {
  return this.collegeWiseCourseService.getCoursesWithDetails(page, limit,college_id);
}


@Get("/singleCourse/:course_id")
async getSingleCourseDetails(@Param("course_id") course_id: number) {
  return this.collegeWiseCourseService.findCourseDetails(course_id);
}

@Put("/updateCourse/:course_id")
async updateCourseDetails(
  @Param("course_id") course_id: string,
  @Body() updateSingleCourseDto: UpdateSingleCourseDto
) {
  const courseIdNum = Number(course_id);
  if (isNaN(courseIdNum)) {
    throw new BadRequestException("Invalid course ID");
  }
  return this.collegeWiseCourseService.updateCourseDetails(courseIdNum, updateSingleCourseDto);
}



}
