import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
  UseGuards,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { CollegeExamService } from "./college_exam.service";
import { CreateCollegeExamDto } from "./dto/create-college_exam.dto";
import { UpdateCollegeExamDto } from "./dto/update-college_exam.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("college-exam")
@Controller("college-exam")
// @UseGuards(JwtAuthGuard)
export class CollegeExamController {
  constructor(private readonly collegeExamService: CollegeExamService) {}

  @Get()
  @ApiOperation({
    summary:
      "Get all college exams with optional filters for exam_id and college_id",
  })
  @ApiResponse({ status: 200, description: "List of college exams." })
  @ApiQuery({ name: "eid", required: false, description: "Filter by exam ID" })
  @ApiQuery({
    name: "cid",
    required: false,
    description: "Filter by college ID",
  })
  findAll(@Query("eid") examId?: number, @Query("cid") collegeId?: number) {
    return this.collegeExamService.findAllWithFilters(examId, collegeId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a college exam by ID" })
  @ApiResponse({ status: 200, description: "College exam details." })
  @ApiResponse({ status: 404, description: "College exam not found." })
  findOne(@Param("id") id: number) {
    return this.collegeExamService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new college exam" })
  @ApiResponse({
    status: 201,
    description: "College exam created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createCollegeExamDto: CreateCollegeExamDto) {
    return this.collegeExamService.create(createCollegeExamDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a college exam" })
  @ApiResponse({
    status: 200,
    description: "College exam updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College exam not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCollegeExamDto: UpdateCollegeExamDto
  ) {
    return this.collegeExamService.update(id, updateCollegeExamDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a college exam" })
  @ApiResponse({
    status: 200,
    description: "College exam deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College exam not found." })
  delete(@Param("id") id: number) {
    return this.collegeExamService.delete(id);
  }

  // Get the college_exam data by using college_id
  @Get("by-college")
  @ApiOperation({ summary: "Get college content by College ID" })
  @ApiQuery({
    name: "cid",
    required: true,
    description: "College ID to fetch related content",
  })
  @ApiResponse({ status: 200, description: "List of college content." })
  async findByCollegeId(@Query("cid", ParseIntPipe) collegeId: number) {
    return this.collegeExamService.findByCollegeId(collegeId);
  }
}
