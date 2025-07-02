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
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { CollegeHostelCampusService } from "./college-hostel-and-campus.service";
import { CreateCollegeHostelCampusDto } from "./dto/create-college-hostelcampus.dto";
import { UpdateCollegeHostelCampusDto } from "./dto/update-college-hostelcampus.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("college-hostelcampus")
@Controller("college-hostelcampus")
// @UseGuards(JwtAuthGuard)
export class CollegeHostelCampusController {
  constructor(
    private readonly collegeHostelCampusService: CollegeHostelCampusService
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all records" })
  @ApiResponse({ status: 200, description: "List of records." })
  findAll() {
    return this.collegeHostelCampusService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a record by ID" })
  @ApiResponse({ status: 200, description: "Record details." })
  @ApiResponse({ status: 404, description: "Record not found." })
  findOne(@Param("id") id: number) {
    return this.collegeHostelCampusService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new record" })
  @ApiResponse({ status: 201, description: "Record created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(
    @Body(ValidationPipe)
    createCollegeHostelCampusDto: CreateCollegeHostelCampusDto
  ) {
    return this.collegeHostelCampusService.create(createCollegeHostelCampusDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a record" })
  @ApiResponse({ status: 200, description: "Record updated successfully." })
  @ApiResponse({ status: 404, description: "Record not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe)
    updateCollegeHostelCampusDto: UpdateCollegeHostelCampusDto
  ) {
    return this.collegeHostelCampusService.update(
      id,
      updateCollegeHostelCampusDto
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a record" })
  @ApiResponse({ status: 200, description: "Record deleted successfully." })
  @ApiResponse({ status: 404, description: "Record not found." })
  delete(@Param("id") id: number) {
    return this.collegeHostelCampusService.delete(id);
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
    return this.collegeHostelCampusService.findByCollegeId(collegeId);
  }
}
