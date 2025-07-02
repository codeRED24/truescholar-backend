import { PartialType } from '@nestjs/mapped-types';
import { CreateRankingAgencyDto } from './create-ranking_agency.dto';

export class UpdateRankingAgencyDto extends PartialType(
  CreateRankingAgencyDto,
) {}
