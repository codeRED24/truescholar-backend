import { PartialType } from '@nestjs/mapped-types';
import { CreateExamDto } from './create-exams.dto';

export class UpdateExamDto extends PartialType(CreateExamDto) {}
