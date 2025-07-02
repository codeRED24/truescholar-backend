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
import { ExamDateService } from "./exam-dates.service";
import { CreateExamDateDto } from "./dto/create-exam_date.dto";
import { UpdateExamDateDto } from "./dto/update-exam_date.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("exam_dates")
@Controller("exam_dates")
// @UseGuards(JwtAuthGuard)
export class ExamDateController {
  constructor(private readonly examDateService: ExamDateService) {}

  @Get()
  @ApiOperation({ summary: "Get all exam dates" })
  @ApiQuery({
    name: "event_Title",
    required: false,
    description: "Title of the event",
  })
  @ApiResponse({ status: 200, description: "List of exam dates." })
  findAll(@Query("event_Title") event_Title?: string) {
    // const currentYear = new Date().getFullYear(); 
    return this.examDateService.findAll(event_Title );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an exam date by ID" })
  @ApiResponse({ status: 200, description: "Exam date details." })
  @ApiResponse({ status: 404, description: "Exam date not found." })
  findOne(@Param("id") id: number) {
    return this.examDateService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new exam date" })
  @ApiResponse({ status: 201, description: "Exam date created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createExamDateDto: CreateExamDateDto) {
    return this.examDateService.create(createExamDateDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an exam date" })
  @ApiResponse({ status: 200, description: "Exam date updated successfully." })
  @ApiResponse({ status: 404, description: "Exam date not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateExamDateDto: UpdateExamDateDto
  ) {
    return this.examDateService.update(id, updateExamDateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an exam date" })
  @ApiResponse({ status: 200, description: "Exam date deleted successfully." })
  @ApiResponse({ status: 404, description: "Exam date not found." })
  delete(@Param("id") id: number) {
    return this.examDateService.delete(id);
  }

  // Get the exam date data by using exam_id
  @Get("by-exam")
  @ApiOperation({ summary: "Get exam content by exam ID" })
  @ApiQuery({
    name: "eid",
    required: true,
    description: "Exam ID to fetch related content",
  })
  @ApiResponse({ status: 200, description: "List of exam date." })
  async findByCollegeId(@Query("eid", ParseIntPipe) examId: number) {
    const currentYear = new Date().getFullYear();
    return this.examDateService.findByExamId(examId);
  }
}
