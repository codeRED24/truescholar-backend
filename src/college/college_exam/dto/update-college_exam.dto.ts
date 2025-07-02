import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeExamDto } from './create-college_exam.dto';

export class UpdateCollegeExamDto extends PartialType(CreateCollegeExamDto) {}
