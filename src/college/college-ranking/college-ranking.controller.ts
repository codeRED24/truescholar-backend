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
import { CollegeRankingService } from "./college-ranking.service";
import { CreateCollegeRankingDto } from "./dto/create-college-ranking.dto";
import { UpdateCollegeRankingDto } from "./dto/update-college-ranking.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("college-ranking")
@Controller("college-ranking")
// @UseGuards(JwtAuthGuard)
export class CollegeRankingController {
  constructor(private readonly collegeRankingService: CollegeRankingService) {}

  @Get()
  @ApiOperation({ summary: "Get all college rankings" })
  @ApiResponse({ status: 200, description: "List of college rankings." })
  findAll() {
    return this.collegeRankingService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a college ranking by ID" })
  @ApiResponse({ status: 200, description: "College Ranking details." })
  @ApiResponse({ status: 404, description: "College Ranking not found." })
  findOne(@Param("id") id: number) {
    return this.collegeRankingService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new college ranking" })
  @ApiResponse({
    status: 201,
    description: "College Ranking created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(
    @Body(ValidationPipe) createCollegeRankingDto: CreateCollegeRankingDto
  ) {
    return this.collegeRankingService.create(createCollegeRankingDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a college ranking" })
  @ApiResponse({
    status: 200,
    description: "College Ranking updated successfully.",
  })
  @ApiResponse({ status: 404, description: "College Ranking not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCollegeRankingDto: UpdateCollegeRankingDto
  ) {
    return this.collegeRankingService.update(id, updateCollegeRankingDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a college ranking" })
  @ApiResponse({
    status: 200,
    description: "College Ranking deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "College Ranking not found." })
  delete(@Param("id") id: number) {
    return this.collegeRankingService.delete(id);
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
    return this.collegeRankingService.findByCollegeId(collegeId);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Create bulk college rankings" })
  @ApiResponse({
    status: 201,
    description: "College Rankings created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  createBulk(
    @Body(ValidationPipe) createCollegeRankingDtos: CreateCollegeRankingDto[]
  ) {
    return this.collegeRankingService.createBulk(createCollegeRankingDtos);
  }
}
