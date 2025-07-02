import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    ParseIntPipe,
  } from "@nestjs/common";
  import { CreateExamDocumentDto } from "./dto/create-exam-document.dto";
  import { UpdateExamDocumentDto } from "./dto/update-exam-document.dto";
  import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ExamDocumentService } from "./exams-document.service";  

  @ApiTags("exam-documents")
  @Controller("exam-documents")
  export class ExamDocumentController {
    constructor(private readonly examDocumentService: ExamDocumentService) {}
  
    @Get()
    @ApiOperation({ summary: "Get all exam documents" })
    @ApiResponse({ status: 200, description: "List of exam documents." })
    findAll() {
      return this.examDocumentService.findAll();
    }
  
    @Get(":id")
    @ApiOperation({ summary: "Get an exam document by ID" })
    @ApiResponse({ status: 200, description: "Exam document details." })
    findOne(@Param("id", ParseIntPipe) id: number) {
      return this.examDocumentService.findOne(id);
    }
  
    @Post()
    @ApiOperation({ summary: "Create a new exam document" })
    @ApiResponse({ status: 201, description: "Exam document created." })
    create(@Body() dto: CreateExamDocumentDto) {
      return this.examDocumentService.create(dto);
    }
  
    @Patch(":id")
    @ApiOperation({ summary: "Update an exam document by ID" })
    @ApiResponse({ status: 200, description: "Exam document updated." })
    update(
      @Param("id", ParseIntPipe) id: number,
      @Body() dto: UpdateExamDocumentDto,
    ) {
      return this.examDocumentService.update(id, dto);
    }
  
    @Delete(":id")
    @ApiOperation({ summary: "Delete an exam document by ID" })
    @ApiResponse({ status: 204, description: "Exam document deleted." })
    delete(@Param("id", ParseIntPipe) id: number) {
      return this.examDocumentService.delete(id);
    }
  }
  