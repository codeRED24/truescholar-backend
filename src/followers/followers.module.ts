import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Follow } from "./follow.entity";
import { FollowCollege } from "./follow-college.entity";
import { FollowRepository } from "./follow.repository";
import { FollowCollegeRepository } from "./follow-college.repository";
import { FollowersService } from "./followers.service";
import { FollowersController } from "./followers.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Follow, FollowCollege])],
  controllers: [FollowersController],
  providers: [FollowRepository, FollowCollegeRepository, FollowersService],
  exports: [FollowersService],
})
export class FollowersModule {}
