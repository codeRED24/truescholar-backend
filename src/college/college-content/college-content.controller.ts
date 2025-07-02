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

import { CollegeContentService } from "./college-content.service";
import { CreateCollegeContentDto } from "./dto/create-college-content.dto";
import { UpdateCollegeContentDto } from "./dto/update-college-content.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("college-content")
@Controller("college-content")
// @UseGuards(JwtAuthGuard)
export class CollegeContentController {
  constructor(private readonly collegeContentService: CollegeContentService) {}

  @Get()
  @ApiOperation({ summary: "Get all college content" })
  @ApiQuery({
    name: "title",
    required: false,
    description: "Title of the college content",
  })
  @ApiResponse({ status: 200, description: "List of college content." })
  findAll(@Query("title") title?: string) {
    return this.collegeContentService.findAll(title);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get college content by ID" })
  @ApiResponse({ status: 200, description: "College content details." })
  @ApiResponse({ status: 404, description: "College content not found." })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.collegeContentService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new college content" })
  @ApiResponse({
    status: 201,
    description: "College content created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(
    @Body(ValidationPipe) createCollegeContentDto: CreateCollegeContentDto
  ) {
    return this.collegeContentService.create(createCollegeContentDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update college content" })
  @ApiResponse({
    status: 200,
    description: "College content updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College content not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCollegeContentDto: UpdateCollegeContentDto
  ) {
    return this.collegeContentService.update(id, updateCollegeContentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete college content" })
  @ApiResponse({
    status: 200,
    description: "College content deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College content not found." })
  delete(@Param("id") id: number) {
    return this.collegeContentService.delete(id);
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
    return this.collegeContentService.findByCollegeId(collegeId);
  }
}
