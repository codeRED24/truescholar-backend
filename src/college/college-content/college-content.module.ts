import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeContentService } from "./college-content.service";
import { CollegeContentController } from "./college-content.controller";
import { CollegeContent } from "./college-content.entity";
import { CollegeInfo } from "../college-info/college-info.entity";
@Module({
  imports: [TypeOrmModule.forFeature([CollegeContent, CollegeInfo])],
  providers: [CollegeContentService],
  controllers: [CollegeContentController],
  exports: [TypeOrmModule],
})
export class CollegeContentModule {}
