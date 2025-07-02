import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import CMSCollegeExamMappingService from "./college-exam-mapping.service";
import CMSCollegeExamMappingController from "./college-exam-mapping.controller";
import { CollegeExamMapping } from "./college-exam-mapping.entity";
import { Logs } from "../cms-logs/logs.entity";
import { LogsService } from "../cms-logs/logs.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([CollegeExamMapping, Logs])
    ],  
    providers: [CMSCollegeExamMappingService, LogsService],
    controllers: [CMSCollegeExamMappingController],
    exports: [TypeOrmModule],
})

export class CmsCollegeExamMappingModule {}