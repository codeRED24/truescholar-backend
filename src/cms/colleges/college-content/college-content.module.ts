import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import CmsCollegeContentController from "./college-content.controller";
import CmsCollegeContentService from "./college-content.service";
import { CollegeContent } from "../../../college/college-content/college-content.entity";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { Logs } from "../../../cms/cms-logs/logs.entity";
import { LogsModule } from "../../../cms/cms-logs/logs.module";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";

@Module({
  imports: [TypeOrmModule.forFeature([CollegeContent, Logs]), LogsModule],
  controllers: [CmsCollegeContentController],
  providers: [CmsCollegeContentService, LogsService, FileUploadService],
  exports: [TypeOrmModule],
})
export class CmsCollegeContentModule {}
