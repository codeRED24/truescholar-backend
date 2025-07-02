import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../../articles_modules/articles/articles.entity';
import { Logs } from '../cms-logs/logs.entity';
import { LogsModule } from '../cms-logs/logs.module';
import { LogsService } from '../cms-logs/logs.service';
import { FileUploadService } from '../../utils/file-upload/fileUpload.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Logs]), LogsModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, LogsService, FileUploadService],
  exports: [TypeOrmModule]
})
export class ArticlesModule {}
