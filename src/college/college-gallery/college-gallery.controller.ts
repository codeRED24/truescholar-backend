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
import { CollegeGalleryService } from "./college-gallery.service";
import { CreateCollegeGalleryDto } from "./dto/create-college-gallery.dto";
import { UpdateCollegeGalleryDto } from "./dto/update-college-gallery.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("college-gallery")
@Controller("college-gallery")
// @UseGuards(JwtAuthGuard)
export class CollegeGalleryController {
  constructor(private readonly collegeGalleryService: CollegeGalleryService) {}

  @Get()
  @ApiOperation({ summary: "Get all college galleries" })
  @ApiResponse({ status: 200, description: "List of college galleries." })
  findAll() {
    return this.collegeGalleryService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a college gallery by ID" })
  @ApiResponse({ status: 200, description: "College gallery details." })
  @ApiResponse({ status: 404, description: "College gallery not found." })
  findOne(@Param("id") id: number) {
    return this.collegeGalleryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new college gallery" })
  @ApiResponse({
    status: 201,
    description: "College gallery created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(
    @Body(ValidationPipe) createCollegeGalleryDto: CreateCollegeGalleryDto
  ) {
    return this.collegeGalleryService.create(createCollegeGalleryDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a college gallery" })
  @ApiResponse({
    status: 200,
    description: "College gallery updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College gallery not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCollegeGalleryDto: UpdateCollegeGalleryDto
  ) {
    return this.collegeGalleryService.update(id, updateCollegeGalleryDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a college gallery" })
  @ApiResponse({
    status: 200,
    description: "College gallery deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College gallery not found." })
  delete(@Param("id") id: number) {
    return this.collegeGalleryService.delete(id);
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
    return this.collegeGalleryService.findByCollegeId(collegeId);
  }
}
