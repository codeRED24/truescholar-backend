import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReelsService } from "./reels.service";
import { ReelsController } from "./reels.controller";
import { Reel } from "./entities/reel.entity";
import { FileUploadService } from "../utils/file-upload/fileUpload.service";

@Module({
  imports: [TypeOrmModule.forFeature([Reel])],
  controllers: [ReelsController],
  providers: [ReelsService, FileUploadService],
})
export class ReelsModule {}
