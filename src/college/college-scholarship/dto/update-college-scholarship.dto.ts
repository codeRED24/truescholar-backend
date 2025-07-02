import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeScholarshipDto } from './create-college-scholarship.dto';

export class UpdateCollegeScholarshipDto extends PartialType(
  CreateCollegeScholarshipDto,
) {}
