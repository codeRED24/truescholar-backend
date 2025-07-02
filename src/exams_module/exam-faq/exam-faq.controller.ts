import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ExamFAQService } from './exam-faq.service';
import { CreateExamFAQDto } from './dto/create-exam-faq.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UpdateExamFAQDto } from './dto/update-exam-faq.dto';
@ApiTags('exam-faq')
@Controller('exam-faq')
export class ExamFAQController {
  constructor(private readonly examFAQService: ExamFAQService) {}

  @Get()
  @ApiOperation({ summary: 'Get all FAQs' })
  findAll() {
    return this.examFAQService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an FAQ by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examFAQService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new FAQ' })
  create(@Body(ValidationPipe) createExamFAQDto: CreateExamFAQDto) {
    return this.examFAQService.create(createExamFAQDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an FAQ by ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateExamFAQDto: UpdateExamFAQDto,
  ) {
    return this.examFAQService.update(id, updateExamFAQDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an FAQ by ID' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.examFAQService.delete(id);
  }
}
