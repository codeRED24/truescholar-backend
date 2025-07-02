import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import CmsCourseContentController from "./course-content.controller";
import CmsCourseContentService from "./course-content.service";
import { CourseContent } from "../course-content/course-content.entity";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { Logs } from "../../../cms/cms-logs/logs.entity";
import { LogsModule } from "../../../cms/cms-logs/logs.module";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";

@Module({
  imports: [TypeOrmModule.forFeature([CourseContent, Logs]), LogsModule],
  controllers: [CmsCourseContentController],
  providers: [CmsCourseContentService, LogsService, FileUploadService],
  exports: [TypeOrmModule],
})
export class CmsCourseContentModule { }
