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
import { LeadFormService } from './lead-form.service';
import { CreateLeadFormDto } from './dto/create-lead-form.dto';
import { UpdateLeadFormDto } from './dto/update-lead-form.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('lead-form')
@Controller('lead-form')
export class LeadFormController {
  constructor(private readonly leadFormService: LeadFormService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lead forms' })
  findAll() {
    return this.leadFormService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead form by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leadFormService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lead form' })
  create(@Body(ValidationPipe) createLeadFormDto: CreateLeadFormDto) {
    return this.leadFormService.create(createLeadFormDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead form by ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateLeadFormDto: UpdateLeadFormDto,
  ) {
    return this.leadFormService.update(id, updateLeadFormDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead form by ID' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.leadFormService.delete(id);
  }
}
