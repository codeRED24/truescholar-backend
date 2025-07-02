import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
  BadRequestException
} from "@nestjs/common";
import { CourseService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-courses.dto";
import { UpdateCourseDto } from "./dto/update-courses.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("courses")
@Controller("courses")
// @UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: "Get all courses" })
  @ApiQuery({
    name: "course_name",
    required: false,
    description: "Name of the course",
  })
  @ApiQuery({
    name: "spec_id",
    required: false,
    description: "Filter courses by specialization ID",
  })
  @ApiResponse({ status: 200, description: "List of courses." })
  findAll(
    @Query("course_name") course_name?: string,
    @Query("spec_id") spec_id?: number
  ) {
    return this.courseService.findAll(course_name, spec_id);
  }

  @Get("/list")
  @ApiOperation({ summary: "Get paginated list of courses with search" })
  async getAllCourses(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 9,
    @Query("search") search?: string
  ) {
    page = Number(page);
    limit = Number(limit);
  
    return this.courseService.getAllCourses(page, limit, search);
  }
  


  @Get(":id")
  @ApiOperation({ summary: "Get a course by ID" })
  @ApiResponse({ status: 200, description: "Course details." })
  @ApiResponse({ status: 404, description: "Course not found." })
  findOne(@Param("id") id: number) {
    return this.courseService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new course" })
  @ApiResponse({ status: 201, description: "Course created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a course" })
  @ApiResponse({ status: 200, description: "Course updated successfully." })
  @ApiResponse({ status: 404, description: "Course not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCourseDto: UpdateCourseDto
  ) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a course" })
  @ApiResponse({ status: 200, description: "Course deleted successfully." })
  @ApiResponse({ status: 404, description: "Course not found." })
  delete(@Param("id") id: number) {
    return this.courseService.delete(id);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Create multiple courses" })
  @ApiResponse({ status: 201, description: "Courses created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  createBulk(@Body(ValidationPipe) createCourseDtos: CreateCourseDto[]) {
    return this.courseService.createBulk(createCourseDtos);
  }


  @Get("/silos/:slug/:silo_name")
getCourseContentBySilo(
  @Param("slug") slug: string,
  @Param("silo_name") silo_name: string
) {
  return this.courseService.getCourseContentBySilo(slug, silo_name);
}

  

@Get("/:course_id/info")
async getInfoWithSilos(@Param("course_id") course_id: string) {
  const parseId = parseInt(course_id);

  console.log("Parsed Course ID:", parseId, "Original Type:", typeof parseId);

  if (isNaN(parseId)) {
    throw new BadRequestException("Invalid course ID format");
  }

  return this.courseService.getInfoWithSilos(parseId);
}

@Get("content/:slug/overview")   
async getInfoBySlug(@Param("slug") slug: string) {
  return this.courseService.getInfoBySlug(slug);
}




}
