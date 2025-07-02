import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { Author } from './author.entity';
import { ExamContent } from '../../exams_module/exam-content/exam_content.entity';
import { CollegeContent } from '../../college/college-content/college-content.entity';
import { Article } from '../articles/articles.entity';
import { Exam } from '../../exams_module/exams/exams.entity';
import { CollegeInfo } from '../../college/college-info/college-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Author, ExamContent, CollegeContent, Article, Exam, CollegeInfo])],
  providers: [AuthorService],
  controllers: [AuthorController],
  exports: [TypeOrmModule],
})
export class AuthorModule {}
