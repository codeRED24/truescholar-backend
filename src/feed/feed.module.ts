import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";

// Entities
import { Post } from "../posts/post.entity";

// Services
import { FeedService } from "./feed.service";
import { FeedCacheService } from "./feed-cache.service";
import { FeedFanoutService } from "./feed-fanout.service";
import { TrendingService } from "./trending.service";

// Controller
import { FeedController } from "./feed.controller";

// Dependencies
import { ConnectionsModule } from "../connections/connections.module";
import { LikesModule } from "../likes/likes.module";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    ScheduleModule.forRoot(),
    ConnectionsModule,
    LikesModule,
    SharedModule,
  ],
  providers: [
    FeedService,
    FeedCacheService,
    FeedFanoutService,
    TrendingService,
  ],
  controllers: [FeedController],
  exports: [FeedService, FeedCacheService],
})
export class FeedModule {}
