import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeWisePlacementDto } from './create-collegewiseplacement.dto';

export class UpdateCollegeWisePlacementDto extends PartialType(
  CreateCollegeWisePlacementDto,
) {}
