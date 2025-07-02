import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollegeScholarshipService } from './college-scholarship.service';
import { CollegeScholarshipController } from './college-scholarship.controller';
import { CollegeScholarship } from './college-scholarship.entity';
import { CollegeInfo } from '../college-info/college-info.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CollegeScholarship, CollegeInfo])],
  providers: [CollegeScholarshipService],
  controllers: [CollegeScholarshipController],
  exports: [TypeOrmModule],
})
export class CollegeScholarshipModule {}
