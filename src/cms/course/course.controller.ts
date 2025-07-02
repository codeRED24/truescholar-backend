import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { RolesGuard } from "../auth/utils/roles.guard";
import { UpdateCourseDto } from "../course/dto/update-course.dto";
import { CourseLevels } from "../../common/enums";
import { JwtCmsAuthGuard } from "../auth/jwt.cmsAuth.guard";




@UseGuards(JwtCmsAuthGuard)
@ApiTags("courses")
@Controller("cms/courses")
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: "Create a new course" })
  @ApiResponse({ status: 201, description: "Course created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get("/all")
  async getAllCourses(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("stream_id") streamId?: string,
    @Query("specialization_id") specializationId?: string,
    @Query("course_level") courseLevel?: CourseLevels,
    @Query("is_active") isActive?: boolean,
    @Query("course_name") courseName?: string
  ) {
    return this.courseService.getAllCourses({
      page,
      limit,
      streamId,
      specializationId,
      courseLevel,
      isActive,
      courseName,
    });
  }

  @UseGuards(RolesGuard)
  @Put("/update/:course_id")
  UpdateCourse(
    @Body(ValidationPipe) updateCourseContentDTO: UpdateCourseDto,
    @Param("course_id") course_id: number,
    @Req() req: any
  ) {
    const user_id = req.user?.userId;
    return this.courseService.updateCourse(
      updateCourseContentDTO,
      course_id,
      user_id
    );
  }

  @Get("/sort/all")
  async getCourse(
    @Query("course_name") course_name: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10
  ) {
    return this.courseService.searchCourse(course_name, page, limit);
  }

  @Get("/:college_id")
  async getCourseByCollegeId(@Param("college_id") college_id: string, @Query('course_name') course_name?: string) {
    const parsedId = parseInt(college_id);
    return this.courseService.getCourseByCollegeId(parsedId, course_name);
  }
}











