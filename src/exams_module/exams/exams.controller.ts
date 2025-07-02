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
  async getAllExamsListing(
    @Query("page") page: number = 1,
    @Query("pageSize") limit: number = 15,
    // @Query("exam_category") examCategory?: string,
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

    return this.examsService.findAllExamsListing(
      page,
      limit,
      // examCategory,
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
  async getExamFilters(
    // @Query("exam_level") examLevel?: string,
    @Query("exam_streams") examStreams?: string
  ): Promise<any> {
    // Parse comma-separated values into arrays
    const streamsArray = examStreams
      ? examStreams.split(",").map((s) => s.trim())
      : undefined;

    return this.examsService.findAllExamsFilters(
      // examLevel,
      streamsArray
    );
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
}
