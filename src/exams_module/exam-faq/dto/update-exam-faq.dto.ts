import { PartialType } from '@nestjs/mapped-types';
import { CreateExamFAQDto } from './create-exam-faq.dto';
export class UpdateExamFAQDto extends PartialType(CreateExamFAQDto) {}
