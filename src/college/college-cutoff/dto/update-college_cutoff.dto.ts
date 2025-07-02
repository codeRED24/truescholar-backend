import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeCutoffDto } from './create-college_cutoff.dto';

export class UpdateCollegeCutoffDto extends PartialType(
  CreateCollegeCutoffDto,
) {}
