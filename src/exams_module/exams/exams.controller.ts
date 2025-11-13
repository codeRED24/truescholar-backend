import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  ClassSerializerInterceptor,
  Query,
} from "@nestjs/common";
import { ExamsService } from "./exams.service";
import { CreateExamDto } from "./dto/create-exams.dto";
import { UpdateExamDto } from "./dto/update-exams.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { Exam } from "./exams.entity";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";
import { ExamInfoDto } from "./dto/exam-info.dto";
import { ExamListingDto } from "./dto/exam-listing.dto";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { ExamSitemapResponseDto } from "./dto/exam-sitemap-response.dto";

@ApiTags("exams")
@UseInterceptors(ClassSerializerInterceptor)
@Controller("exams")
// @UseInterceptors(CacheInterceptor)
// @UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @ApiOperation({ summary: "Create an EXAM" })
  @ApiResponse({ status: 201, description: "Exam created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body() createExamDto: CreateExamDto): Promise<Exam> {
    return this.examsService.create(createExamDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all Exams" })
  @ApiResponse({ status: 200, description: "List of all Exams." })
  findAll(): Promise<Exam[]> {
    return this.examsService.findAll();
  }

  // @Get("/filters")
  // @ApiOperation({ summary: "Get all Exams" })
  // @ApiResponse({ status: 200, description: "List of all Exams." })
  // findAllByFilter(): Promise<Exam[]> {
  //   return this.examsService.findAllByFilter();
  // }

  @Get(":id")
  @ApiOperation({ summary: "Get an Exam by ID" })
  @ApiResponse({ status: 200, description: "Exam details." })
  @ApiResponse({ status: 404, description: "Exam not found." })
  findOne(@Param("id") id: number): Promise<Exam> {
    return this.examsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an Exam" })
  @ApiResponse({ status: 200, description: "Exam updated successfully." })
  @ApiResponse({ status: 404, description: "Exam not found." })
  update(
    @Param("id") id: number,
    @Body() updatedExamDto: UpdateExamDto
  ): Promise<{ message: string; data?: Exam }> {
    return this.examsService.update(id, updatedExamDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an Exam" })
  @ApiResponse({ status: 200, description: "Exam deleted successfully." })
  @ApiResponse({ status: 404, description: "Exam not found." })
  delete(@Param("id") id: number): Promise<{ message: string }> {
    return this.examsService.delete(id);
  }

  @ApiOperation({ summary: "Get detailed exam info" })
  @Get(":id/info")
  getExamInfo(@Param("id") id: number): Promise<ExamInfoDto> {
    return this.examsService.getExamInfo(id);
  }

  @Get("/silos/:exam_id/:silo_name")
  getExamInfoById(
    @Param("exam_id") exam_id: number,
    @Param("silo_name") silo_name: string
  ) {
    return this.examsService.getExamInfoById(exam_id, silo_name);
  }

  @ApiOperation({ summary: "Get detailed exam info by slug" })
  @Get("info/:slug")
  getExamInfoBySlug(@Param("slug") slug: string): Promise<ExamInfoDto> {
    return this.examsService.getExamInfoBySlug(slug);
  }

  @Get("/listing")
  @ApiOperation({ summary: "Get all exams with listing fields and filters" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "pageSize",
    required: false,
    type: Number,
    description: "Items per page (default: 15)",
  })
  @ApiQuery({
    name: "mode_of_exam",
    required: false,
    type: String,
    description: "Filter by exam mode",
  })
  @ApiQuery({
    name: "exam_level",
    required: false,
    type: String,
    description: "Filter by exam level",
  })
  @ApiQuery({
    name: "exam_streams",
    required: false,
    type: String,
    description: "Filter by exam streams",
  })
  async getAllExamsListing(
    @Query("page") page: number = 1,
    @Query("pageSize") limit: number = 15,
    @Query("mode_of_exam") modeOfExam?: string,
    @Query("exam_level") examLevel?: string,
    @Query("exam_streams") examStreams?: string
  ): Promise<any> {
    // Parse comma-separated values into arrays
    const levelArray = examLevel
      ? examLevel.split(",").map((s) => s.trim())
      : undefined;
    const streamsArray = examStreams
      ? examStreams.split(",").map((s) => s.trim())
      : undefined;
    const modeOfExamArray = modeOfExam
      ? modeOfExam.split(",").map((s) => s.trim())
      : undefined;

    return this.examsService.findAllExamsListing(
      page,
      limit,
      modeOfExamArray,
      levelArray,
      streamsArray
    );
  }

  @Get("/meta-data")
  @ApiOperation({ summary: "Get all exams with listing fields and filters" })
  async getMetaData(
    // @Query("exam_category") examCategory?: string,
    // @Query("exam_level") examLevel?: string,
    @Query("exam_streams") examStreams?: string
  ): Promise<any> {
    // Parse comma-separated values into arrays
    const streamsArray = examStreams
      ? examStreams.split(",").map((s) => s.trim())
      : undefined;

    return this.examsService.findTop3Exams(
      // examCategory,
      // examLevel,
      streamsArray
    );
  }

  @Get("/exam-filters")
  @ApiOperation({ summary: "Get all exams with listing fields and filters" })
  @ApiQuery({ name: "exam_level", required: false })
  async getExamFilters() // @Query("exam_level") examLevel?: string,
  // @Query("exam_streams") examStreams?: string
  : Promise<any> {
    // Parse comma-separated values into arrays
    // const streamsArray = examStreams
    //   ? examStreams.split(",").map((s) => s.trim())
    //   : undefined;

    return this.examsService.findAllExamsFilters();
  }

  @Post("/bulk")
  @ApiOperation({ summary: "Create multiple Exams" })
  @ApiResponse({ status: 201, description: "Exams created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  createBulk(@Body() createExamDtos: CreateExamDto[]): Promise<Exam[]> {
    return this.examsService.createBulk(createExamDtos);
  }

  @Get("/stream/:streamId")
  @ApiOperation({ summary: "Get exams by stream ID" })
  @ApiResponse({
    status: 200,
    description: "List of exams filtered by stream ID.",
  })
  async getExamsByStream(@Param("streamId") streamId: number): Promise<any[]> {
    return this.examsService.findExamsByStream(streamId);
  }

  @Get("/news/:id")
  @ApiOperation({ summary: "Get all news for a specific exam" })
  @ApiResponse({
    status: 200,
    description: "List of news articles for the exam.",
  })
  @ApiResponse({ status: 404, description: "Exam not found." })
  async getExamNews(@Param("id") id: number): Promise<any> {
    return this.examsService.getExamNews(id);
  }

  @Get("/news/individual/:newsId")
  @ApiOperation({ summary: "Get individual news by news ID" })
  @ApiResponse({
    status: 200,
    description: "Individual news article details.",
  })
  @ApiResponse({ status: 404, description: "News not found." })
  async getExamNewsByNewsId(@Param("newsId") newsId: number): Promise<any> {
    return this.examsService.getExamNewsByNewsId(newsId);
  }

  @Get("sitemap")
  @ApiOperation({ summary: "Get exam sitemap data with available silos" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number",
    schema: { default: 1 },
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of exams to fetch",
    schema: { default: 1000 },
  })
  @ApiResponse({
    status: 200,
    description: "Exam sitemap data with available silos.",
    type: ExamSitemapResponseDto,
  })
  async getExamSitemapData(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 1000,
    @Query("onlyInfo") onlyInfo: boolean = false
  ): Promise<ExamSitemapResponseDto> {
    return this.examsService.getExamSitemapData(page, limit, onlyInfo);
  }
}
