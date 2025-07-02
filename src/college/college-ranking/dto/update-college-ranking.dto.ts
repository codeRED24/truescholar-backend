import { PartialType } from '@nestjs/mapped-types';
import { CreateCollegeRankingDto } from './create-college-ranking.dto';

export class UpdateCollegeRankingDto extends PartialType(
  CreateCollegeRankingDto,
) {}
