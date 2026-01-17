import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";

// Entities
import { Post } from "../posts/post.entity";

// Services
import { FeedService } from "./feed.service";
import { FeedCacheService } from "./feed-cache.service";
import { TrendingService } from "./trending.service";

// Controller
import { FeedController } from "./feed.controller";
import { FeedEventController } from "./feed-event.controller";

// Dependencies
import { LikesModule } from "../likes/likes.module";
import { FollowersModule } from "../followers/followers.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    ScheduleModule.forRoot(),
    LikesModule,
    FollowersModule,
  ],
  providers: [FeedService, FeedCacheService, TrendingService],
  controllers: [FeedController, FeedEventController],
  exports: [FeedService, FeedCacheService],
})
export class FeedModule {}
