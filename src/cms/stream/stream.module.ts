import { Module } from "@nestjs/common";
import CmsStreamService from "./stream.service";
import CmsStreamController from "./stream.controller";

@Module({
  providers: [CmsStreamService],
  controllers: [CmsStreamController],
})
export class CmsStreamModule {}
