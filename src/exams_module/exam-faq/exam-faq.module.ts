import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamFAQService } from './exam-faq.service';
import { ExamFAQController } from './exam-faq.controller';
import { ExamFAQ } from './exam-faq.entity';
import { Exam } from '../exams/exams.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamFAQ, Exam])],
  providers: [ExamFAQService],
  controllers: [ExamFAQController],
})
export class ExamFAQModule {}
