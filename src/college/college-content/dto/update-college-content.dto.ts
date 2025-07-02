import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeContentDto } from './create-college-content.dto';

export class UpdateCollegeContentDto extends PartialType(
  CreateCollegeContentDto,
) {}
