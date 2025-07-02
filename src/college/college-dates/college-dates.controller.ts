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
import { CollegeDatesService } from "./college-dates.service";
import { CreateCollegeDatesDto } from "./dto/create-college-dates.dto";
import { UpdateCollegeDatesDto } from "./dto/update-college-dates.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";
import { CollegeInfo } from "../college-info/college-info.entity";

@ApiTags("college-dates")
@Controller("college-dates")
// @UseGuards(JwtAuthGuard)
export class CollegeDatesController {
  constructor(private readonly collegeDatesService: CollegeDatesService) {}

  @Get()
  @ApiOperation({ summary: "Get all college dates" })
  @ApiQuery({
    name: "college_cutoff_id",
    required: false,
    description: "ID of the college",
  })
  @ApiResponse({ status: 200, description: "List of college dates." })
  findAll(@Query("college_cutoff_id") college_cutoff_id?: number) {
    return this.collegeDatesService.findAll(college_cutoff_id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a college date by ID" })
  @ApiResponse({ status: 200, description: "College date details." })
  @ApiResponse({ status: 404, description: "College date not found." })
  findOne(@Param("id") id: number) {
    return this.collegeDatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new college date" })
  @ApiResponse({
    status: 201,
    description: "College date created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createCollegeDatesDto: CreateCollegeDatesDto) {
    return this.collegeDatesService.create(createCollegeDatesDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a college date" })
  @ApiResponse({
    status: 200,
    description: "College date updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College date not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCollegeDatesDto: UpdateCollegeDatesDto
  ) {
    return this.collegeDatesService.update(id, updateCollegeDatesDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a college date" })
  @ApiResponse({
    status: 200,
    description: "College date deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College date not found." })
  delete(@Param("id") id: number) {
    return this.collegeDatesService.delete(id);
  }

  // Get the college_content data by using college_id
  @Get("by-college")
  @ApiOperation({ summary: "Get college content by College ID" })
  @ApiQuery({
    name: "cid",
    required: true,
    description: "College ID to fetch related content",
  })
  @ApiResponse({ status: 200, description: "List of college Dates." })
  async findByCollegeId(@Query("cid", ParseIntPipe) collegeId: number) {
    return this.collegeDatesService.findByCollegeId(collegeId);
  }
}
