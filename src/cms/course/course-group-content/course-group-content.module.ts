import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseGroupContent } from "./course-group-content.entity";
import { CourseGroupContentController } from "./course-group-content.controllers";
import { CourseGroupContentService } from "./course-group-content.service";
import { Logs } from "../../cms-logs/logs.entity";
import { LogsModule } from "../../cms-logs/logs.module";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";
import { LogsService } from "../../cms-logs/logs.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([CourseGroupContent, Logs]),
        LogsModule
    ],
    controllers: [CourseGroupContentController],
    providers: [CourseGroupContentService, FileUploadService, LogsService],
    exports: [TypeOrmModule]
})

export class CmsCourseGroupContentModule {}