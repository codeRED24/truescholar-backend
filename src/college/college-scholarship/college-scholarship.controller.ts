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
import { CollegeScholarshipService } from "./college-scholarship.service";
import { CreateCollegeScholarshipDto } from "./dto/create-college-scholarship.dto";
import { UpdateCollegeScholarshipDto } from "./dto/update-college-scholarship.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("college-scholarship")
@Controller("college-scholarship")
// @UseGuards(JwtAuthGuard)
export class CollegeScholarshipController {
  constructor(
    private readonly collegeScholarshipService: CollegeScholarshipService
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all college scholarships" })
  @ApiQuery({
    name: "custom_id",
    required: false,
    description: "Custom ID of the college scholarship",
  })
  @ApiResponse({ status: 200, description: "List of college scholarships." })
  findAll(@Query("custom_id") custom_id?: string) {
    return this.collegeScholarshipService.findAll(custom_id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a college scholarship by ID" })
  @ApiResponse({ status: 200, description: "College scholarship details." })
  @ApiResponse({ status: 404, description: "College scholarship not found." })
  findOne(@Param("id") id: number) {
    return this.collegeScholarshipService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new college scholarship" })
  @ApiResponse({
    status: 201,
    description: "College scholarship created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(
    @Body(ValidationPipe)
    createCollegeScholarshipDto: CreateCollegeScholarshipDto
  ) {
    return this.collegeScholarshipService.create(createCollegeScholarshipDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a college scholarship" })
  @ApiResponse({
    status: 200,
    description: "College scholarship updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College scholarship not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe)
    updateCollegeScholarshipDto: UpdateCollegeScholarshipDto
  ) {
    return this.collegeScholarshipService.update(
      id,
      updateCollegeScholarshipDto
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a college scholarship" })
  @ApiResponse({
    status: 200,
    description: "College scholarship deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College scholarship not found." })
  delete(@Param("id") id: number) {
    return this.collegeScholarshipService.delete(id);
  }

  // Get the college_content data by using college_id
  @Get("by-college")
  @ApiOperation({ summary: "Get college content by College ID" })
  @ApiQuery({
    name: "cid",
    required: true,
    description: "College ID to fetch related content",
  })
  @ApiResponse({ status: 200, description: "List of college content." })
  async findByCollegeId(@Query("cid", ParseIntPipe) collegeId: number) {
    return this.collegeScholarshipService.findByCollegeId(collegeId);
  }
}
