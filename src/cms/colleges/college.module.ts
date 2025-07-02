import { Module } from "@nestjs/common";
import CmsCollegeController from "./college.controller";
import CmsCollegeService from "./college.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { Logs } from "../cms-logs/logs.entity";
import { LogsModule } from "../cms-logs/logs.module";
import { LogsService } from "../cms-logs/logs.service";
import { CmsCollegeContentModule } from "./college-content/college-content.module";
import { CmsCollegeBrochureModule } from "./college-brochure/college-brochure.module";
import { FileUploadService } from "../../utils/file-upload/fileUpload.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([CollegeInfo, Logs]),
    LogsModule,
    CmsCollegeContentModule,
    CmsCollegeBrochureModule,
  ],
  providers: [CmsCollegeService, LogsService ,FileUploadService ],
  controllers: [CmsCollegeController],
  exports: [TypeOrmModule],
})
export class CmsCollegeModule {}
