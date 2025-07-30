import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollegeInfo } from "../college-info/college-info.entity";
import { CollegeSearchService } from "./college-search.service";
import { CollegeSearchController } from "./college-search.controller";

@Module({
  imports: [TypeOrmModule.forFeature([CollegeInfo])],
  providers: [CollegeSearchService],
  controllers: [CollegeSearchController],
})
export class CollegeSearchModule {}
