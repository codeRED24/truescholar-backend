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
import { CollegeVideoService } from "./college-video.service";
import { CreateCollegeVideoDto } from "./dto/create-college-video.dto";
import { UpdateCollegeVideoDto } from "./dto/update-college-video.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("college-video")
@Controller("college-video")
// @UseGuards(JwtAuthGuard)
export class CollegeVideoController {
  constructor(private readonly collegeVideoService: CollegeVideoService) {}

  @Get()
  @ApiOperation({ summary: "Get all college videos" })
  @ApiResponse({ status: 200, description: "List of college videos." })
  findAll() {
    return this.collegeVideoService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a college video by ID" })
  @ApiResponse({ status: 200, description: "College video details." })
  @ApiResponse({ status: 404, description: "College video not found." })
  findOne(@Param("id") id: number) {
    return this.collegeVideoService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new college video" })
  @ApiResponse({
    status: 201,
    description: "College video created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createCollegeVideoDto: CreateCollegeVideoDto) {
    return this.collegeVideoService.create(createCollegeVideoDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a college video" })
  @ApiResponse({
    status: 200,
    description: "College video updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College video not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCollegeVideoDto: UpdateCollegeVideoDto
  ) {
    return this.collegeVideoService.update(id, updateCollegeVideoDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a college video" })
  @ApiResponse({
    status: 200,
    description: "College video deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College video not found." })
  delete(@Param("id") id: number) {
    return this.collegeVideoService.delete(id);
  }

  // Get the college_content data by using college_id
  @Get("by-college")
  @ApiOperation({ summary: "Get college Videos by College ID" })
  @ApiQuery({
    name: "cid",
    required: true,
    description: "College ID to fetch related Videos",
  })
  @ApiResponse({ status: 200, description: "List of college videos." })
  async findByCollegeId(@Query("cid", ParseIntPipe) collegeId: number) {
    return this.collegeVideoService.findByCollegeId(collegeId);
  }
}
