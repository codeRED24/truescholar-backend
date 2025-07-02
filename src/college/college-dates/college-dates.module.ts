import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollegeDatesService } from './college-dates.service';
import { CollegeDatesController } from './college-dates.controller';
import { CollegeDates } from './college-dates.entity';
import { CollegeInfo } from '../college-info/college-info.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CollegeDates, CollegeInfo])],
  providers: [CollegeDatesService],
  controllers: [CollegeDatesController],
  exports: [TypeOrmModule],
})
export class CollegeDatesModule {}
