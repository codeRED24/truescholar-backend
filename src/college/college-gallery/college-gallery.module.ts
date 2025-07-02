import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollegeGalleryService } from './college-gallery.service';
import { CollegeGalleryController } from './college-gallery.controller';
import { CollegeGallery } from './college-gallery.entity';
import { CollegeInfo } from '../college-info/college-info.entity';
@Module({
  imports: [TypeOrmModule.forFeature([CollegeGallery, CollegeInfo])],
  providers: [CollegeGalleryService],
  controllers: [CollegeGalleryController],
  exports: [TypeOrmModule],
})
export class CollegeGalleryModule {}
