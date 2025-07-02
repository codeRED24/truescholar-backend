import { Module } from '@nestjs/common';
import { ExamContentService } from './exam_content.service';
import { ExamContentController } from './exam_content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamContent } from '../../../exams_module/exam-content/exam_content.entity';
import { Logs } from '../../../cms/cms-logs/logs.entity';
import { LogsService } from '../../../cms/cms-logs/logs.service';
import { LogsModule } from '../../../cms/cms-logs/logs.module';
import { FileUploadService } from '../../../utils/file-upload/fileUpload.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExamContent, Logs]), LogsModule],
  controllers: [ExamContentController],
  providers: [ExamContentService, LogsService, FileUploadService],
  exports: [TypeOrmModule],
})
export class ExamContentCMSModule {}
