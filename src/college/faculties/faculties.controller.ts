import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { FacultiesService } from "./faculties.service";
import { CreateFacultiesDto } from "./dto/create-faculties.dto";
import { UpdateFacultiesDto } from "./dto/update-faculties.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";
@ApiTags("faculties")
@Controller("faculties")
// @UseGuards(JwtAuthGuard)
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new faculty" })
  @ApiResponse({ status: 201, description: "Faculty created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body() createFacultiesDto: CreateFacultiesDto) {
    return this.facultiesService.create(createFacultiesDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all faculties" })
  @ApiResponse({ status: 200, description: "List of faculties." })
  findAll() {
    return this.facultiesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a faculty by ID" })
  @ApiResponse({ status: 200, description: "Faculty details." })
  @ApiResponse({ status: 404, description: "Faculty not found." })
  findOne(@Param("id") id: number) {
    return this.facultiesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a faculty" })
  @ApiResponse({ status: 200, description: "Faculty updated successfully." })
  @ApiResponse({ status: 404, description: "Faculty not found." })
  update(
    @Param("id") id: number,
    @Body() updateFacultiesDto: UpdateFacultiesDto
  ) {
    return this.facultiesService.update(id, updateFacultiesDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a faculty" })
  @ApiResponse({ status: 200, description: "Faculty deleted successfully." })
  @ApiResponse({ status: 404, description: "Faculty not found." })
  remove(@Param("id") id: number) {
    return this.facultiesService.remove(id);
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
    return this.facultiesService.findByCollegeId(collegeId);
  }
}
