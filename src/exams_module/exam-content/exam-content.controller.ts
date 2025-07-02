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
import { ExamContentService } from "./exam-content.service";
import { CreateExamContentDto } from "./dto/create-exam_content.dto";
import { UpdateExamContentDto } from "./dto/update-exam_content.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("exam_content")
@Controller("exam_content")
// @UseGuards(JwtAuthGuard)
export class ExamContentController {
  constructor(private readonly examContentService: ExamContentService) {}

  @Get()
  @ApiOperation({ summary: "Get all exam contents" })
  @ApiResponse({ status: 200, description: "List of exam contents." })
  findAll() {
    return this.examContentService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get exam content by ID" })
  @ApiResponse({ status: 200, description: "Exam content details." })
  @ApiResponse({ status: 404, description: "Exam content not found." })
  findOne(@Param("id") id: number) {
    return this.examContentService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create new exam content" })
  @ApiResponse({
    status: 201,
    description: "Exam content created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createExamContentDto: CreateExamContentDto) {
    return this.examContentService.create(createExamContentDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update exam content" })
  @ApiResponse({
    status: 200,
    description: "Exam content updated successfully.",
  })
  @ApiResponse({ status: 404, description: "Exam content not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateExamContentDto: UpdateExamContentDto
  ) {
    return this.examContentService.update(id, updateExamContentDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete exam content" })
  @ApiResponse({
    status: 200,
    description: "Exam content deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "Exam content not found." })
  delete(@Param("id") id: number) {
    return this.examContentService.delete(id);
  }

  // Get the Exam_Content data by using exam_id
  @Get("by-exam")
  @ApiOperation({ summary: "Get exam content by exam ID" })
  @ApiQuery({
    name: "eid",
    required: true,
    description: "Exam ID to fetch related content",
  })
  @ApiResponse({ status: 200, description: "List of exam content." })
  async findByExamId(@Query("eid", ParseIntPipe) examId: number) {
    return this.examContentService.findByExamId(examId);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Bulk create exam content" })
  @ApiResponse({
    status: 201,
    description: "Exam contents created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  bulkCreate(
    @Body(ValidationPipe) createExamContentsDto: CreateExamContentDto[]
  ) {
    return this.examContentService.bulkCreate(createExamContentsDto);
  }
}
