import { PartialType } from '@nestjs/mapped-types';
import { CreateExamDateDto } from './create-exam_date.dto';

export class UpdateExamDateDto extends PartialType(CreateExamDateDto) {}
