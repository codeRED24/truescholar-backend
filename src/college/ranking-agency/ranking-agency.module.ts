import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingAgencyService } from './ranking-agency.service';
import { RankingAgencyController } from './ranking-agency.controller';
import { RankingAgency } from './ranking_agency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RankingAgency])],
  providers: [RankingAgencyService],
  controllers: [RankingAgencyController],
  exports: [TypeOrmModule],
})
export class RankingAgencyModule {}
