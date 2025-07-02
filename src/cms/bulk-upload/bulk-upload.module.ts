import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import BulkUploadSeoService from "./bulk-upload.service";
import { BulkUplaodSeoController } from "./bulk-upload.controller";
import { Logs } from "../cms-logs/logs.entity";
import { LogsService } from "../cms-logs/logs.service";

@Module({
  imports: [TypeOrmModule.forFeature([Logs])],
  providers: [BulkUploadSeoService, LogsService],
  controllers: [BulkUplaodSeoController],
  exports: [TypeOrmModule, BulkUploadSeoService],
})
export class CmsBulkUploadSeoModule {}
