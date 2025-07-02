import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollegeWisePlacementService } from './college-wise-placement.service';
import { CollegeWisePlacementController } from './college-wise-placement.controller';
import { CollegeWisePlacement } from './college-wise-placement.entity';
import { CollegeInfo } from '../college-info/college-info.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CollegeWisePlacement, CollegeInfo])],
  providers: [CollegeWisePlacementService],
  controllers: [CollegeWisePlacementController],
})
export class CollegeWisePlacementModule {}
