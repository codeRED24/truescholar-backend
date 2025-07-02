import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollegeVideoService } from './college-video.service';
import { CollegeVideoController } from './college-video.controller';
import { CollegeVideo } from './college-video.entity';
import { CollegeInfo } from '../college-info/college-info.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CollegeVideo, CollegeInfo])],
  providers: [CollegeVideoService],
  controllers: [CollegeVideoController],
  exports: [TypeOrmModule],
})
export class CollegeVideoModule {}
