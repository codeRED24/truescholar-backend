import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeBrochure } from "./college-brochure.entity";
import CollegeBrochureController from "./college-brochure.controller";
import { CollegeBrochureService } from "./college-brochure.service";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";
import { CollegeInfo } from "../../../college/college-info/college-info.entity";
import { Course } from "../../../courses_module/courses/courses.entity";
import { CourseGroup } from "../../../courses_module/course-group/course_group.entity";
import { Logs } from "../../../cms/cms-logs/logs.entity";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { BrochureMapping } from "./brochure-mapping.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([CollegeBrochure, CollegeInfo, Course, CourseGroup, Logs, BrochureMapping]),
    ],
    controllers: [CollegeBrochureController],
    providers: [CollegeBrochureService, FileUploadService, LogsService],
    exports: [TypeOrmModule],
})

export class CmsCollegeBrochureModule {}