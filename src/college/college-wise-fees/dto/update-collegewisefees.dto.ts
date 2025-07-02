import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeWiseFeesDto } from './create-collegewisefees.dto';

export class UpdateCollegeWiseFeesDto extends PartialType(
  CreateCollegeWiseFeesDto,
) {}
