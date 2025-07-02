import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TemplatizationCollegeContent } from "./entities/templatization_college_content.entity";
import { CmsTemplatizationController } from "./templatization.controller";
import { CmsTemplatizationService } from "./templatization.service";
import { Logs } from "../cms-logs/logs.entity";
import { LogsService } from "../cms-logs/logs.service";
import { LogsModule } from "../cms-logs/logs.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([TemplatizationCollegeContent, Logs]),
    LogsModule,
  ],
  providers: [CmsTemplatizationService, LogsService],
  controllers: [CmsTemplatizationController],
  exports: [TypeOrmModule],
})
export class CmsTemplatizationModule {}
