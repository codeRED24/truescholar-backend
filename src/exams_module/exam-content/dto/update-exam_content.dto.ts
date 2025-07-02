import { PartialType } from '@nestjs/mapped-types';
import { CreateExamContentDto } from './create-exam_content.dto';

export class UpdateExamContentDto extends PartialType(CreateExamContentDto) {}
