import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultiesService } from './faculties.service';
import { FacultiesController } from './faculties.controller';
import { Faculties } from './faculties.entity';
import { CollegeInfo } from '../college-info/college-info.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Faculties, CollegeInfo])],
  controllers: [FacultiesController],
  providers: [FacultiesService],
})
export class FacultiesModule {}
