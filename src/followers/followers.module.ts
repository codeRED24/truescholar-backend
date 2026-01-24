import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Follow } from "./follow.entity";
import { FollowCollege } from "./follow-college.entity";
import { FollowRepository } from "./follow.repository";
import { FollowCollegeRepository } from "./follow-college.repository";
import { FollowersService } from "./followers.service";
import { FollowCacheService } from "./follow-cache.service";
import { DiscoveryService } from "./discovery.service";
import { FollowersController } from "./followers.controller";
import { DiscoveryController } from "./discovery.controller";
import { CollegeMemberModule } from "../college-member/college-member.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, FollowCollege]),
    CollegeMemberModule,
  ],
  controllers: [FollowersController, DiscoveryController],
  providers: [
    FollowRepository,
    FollowCollegeRepository,
    FollowersService,
    FollowCacheService,
    DiscoveryService,
  ],
  exports: [FollowersService, FollowCacheService, DiscoveryService],
})
export class FollowersModule {}
