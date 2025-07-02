import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollegeHostelCampusService } from './college-hostel-and-campus.service';
import { CollegeHostelCampusController } from './college-hostel-and-campus.controller';
import { CollegeHostelCampus } from './college-hostel-and-campus.entity';
import { CollegeInfo } from '../college-info/college-info.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CollegeHostelCampus, CollegeInfo])],
  providers: [CollegeHostelCampusService],
  controllers: [CollegeHostelCampusController],
  exports: [TypeOrmModule],
})
export class CollegeHostelCampusModule {}
