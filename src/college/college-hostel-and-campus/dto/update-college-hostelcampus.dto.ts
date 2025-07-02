import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeHostelCampusDto } from './create-college-hostelcampus.dto';

export class UpdateCollegeHostelCampusDto extends PartialType(
  CreateCollegeHostelCampusDto,
) {}
