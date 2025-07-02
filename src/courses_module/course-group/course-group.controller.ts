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
} from "@nestjs/common";
import { CourseGroupService } from "./course-group.service";
import { CreateCourseGroupDto } from "./dto/create-course_group.dto";
import { UpdateCourseGroupDto } from "./dto/update-course_group.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";
import { NotFoundException } from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { UseInterceptors } from "@nestjs/common";
@ApiTags("course_group")
@Controller("course_group")
// @UseGuards(JwtAuthGuard)
// @UseInterceptors(CacheInterceptor)
export class CourseGroupController {
  constructor(private readonly courseGroupService: CourseGroupService) {}

  @Get()
  @ApiOperation({ summary: "Get all course groups" })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Name of the course group",
  })
  @ApiResponse({ status: 200, description: "List of course groups." })
  findAll(@Query("name") name?: string) {
    return this.courseGroupService.findAll(name);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a course group by ID" })
  @ApiResponse({ status: 200, description: "Course group details." })
  @ApiResponse({ status: 404, description: "Course group not found." })
  findOne(@Param("id") id: number) {
    return this.courseGroupService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new course group" })
  @ApiResponse({
    status: 201,
    description: "Course group created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createCourseGroupDto: CreateCourseGroupDto) {
    return this.courseGroupService.create(createCourseGroupDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a course group" })
  @ApiResponse({
    status: 200,
    description: "Course group updated successfully.",
  })
  @ApiResponse({ status: 404, description: "Course group not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCourseGroupDto: UpdateCourseGroupDto
  ) {
    return this.courseGroupService.update(id, updateCourseGroupDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a course group" })
  @ApiResponse({
    status: 200,
    description: "Course group deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "Course group not found." })
  delete(@Param("id") id: number) {
    return this.courseGroupService.delete(id);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Create multiple course groups" })
  @ApiResponse({
    status: 201,
    description: "Course groups created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  async createBulk(
    @Body(ValidationPipe) createCourseGroupsDto: CreateCourseGroupDto[]
  ) {
    return this.courseGroupService.createBulk(createCourseGroupsDto);
  }

  @Get("listing/:id")
  @ApiOperation({
    summary: "Get course group listing by ID with college details",
  })
  @ApiResponse({
    status: 200,
    description: "Course group and college details.",
  })
  @ApiResponse({ status: 404, description: "Course group not found." })
  async getCourseGroupListing(@Param("id") id: number) {
    const courseGroupData =
      await this.courseGroupService.getCourseGroupListing(id);
    if (!courseGroupData) {
      throw new NotFoundException(`Course group with ID ${id} not found`);
    }
    return courseGroupData;
  }

  @Get("ids-names")
  @ApiOperation({ summary: "Get paginated and filtered course group IDs and names" })
  @ApiResponse({ status: 200, description: "List of course group IDs and names." })
  async getAllCourseGroupIdsAndNames(
    @Query('page') page: number = 1,     
    @Query('limit') limit: number = 9,   
    @Query('search') search?: string      
  ) {
    return this.courseGroupService.getAllCourseGroupIdsAndNames(page, limit, search);
  }
  

}
