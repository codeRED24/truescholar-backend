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
} from "@nestjs/common";
import { CollegeCutoffService } from "./college-cutoff.service";
import { CreateCollegeCutoffDto } from "./dto/create-college_cutoff.dto";
import { UpdateCollegeCutoffDto } from "./dto/update-college_cutoff.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("college_cutoff")
@Controller("college_cutoff")
// @UseGuards(JwtAuthGuard)
export class CollegeCutoffController {
  constructor(private readonly collegeCutoffService: CollegeCutoffService) {}

  @Get()
  @ApiOperation({ summary: "Get all college cutoffs" })
  @ApiResponse({ status: 200, description: "List of college cutoffs." })
  findAll() {
    return this.collegeCutoffService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a college cutoff by ID" })
  @ApiResponse({ status: 200, description: "College cutoff details." })
  @ApiResponse({ status: 404, description: "College cutoff not found." })
  findOne(@Param("id") id: number) {
    return this.collegeCutoffService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new college cutoff" })
  @ApiResponse({
    status: 201,
    description: "College cutoff created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createCollegeCutoffDto: CreateCollegeCutoffDto) {
    return this.collegeCutoffService.create(createCollegeCutoffDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a college cutoff" })
  @ApiResponse({
    status: 200,
    description: "College cutoff updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College cutoff not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCollegeCutoffDto: UpdateCollegeCutoffDto
  ) {
    return this.collegeCutoffService.update(id, updateCollegeCutoffDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a college cutoff" })
  @ApiResponse({
    status: 200,
    description: "College cutoff deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College cutoff not found." })
  delete(@Param("id") id: number) {
    return this.collegeCutoffService.delete(id);
  }

  // Get the college_content data by using college_id
  @Get("by-college")
  @ApiOperation({ summary: "Get college cutoff by College ID" })
  @ApiQuery({
    name: "cid",
    required: true,
    description: "College ID to fetch related cutoffs",
  })
  @ApiResponse({ status: 200, description: "List of college cutoffs." })
  async findByCollegeId(@Query("cid", ParseIntPipe) collegeId: number) {
    return this.collegeCutoffService.findByCollegeId(collegeId);
  }

  // Get the Exam_Content data by using exam_id
  @Get("by-exam")
  @ApiOperation({ summary: "Get exam content by exam ID" })
  @ApiQuery({
    name: "eid",
    required: true,
    description: "Exam ID to fetch related content",
  })
  @ApiResponse({ status: 200, description: "List of exam content." })
  async findByExamId(@Query("eid", ParseIntPipe) examId: number) {
    return this.collegeCutoffService.findByExamId(examId);
  }
}
