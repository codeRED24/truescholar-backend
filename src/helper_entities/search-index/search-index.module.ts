import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SearchIndex } from "./search-index.entity";
import { SearchService } from "./search.service";
import { SearchController } from "./search.controller";
import { SearchEventHandler } from "./search-event.handler";
import { ReindexService } from "./reindex.service";
import { MyElasticsearchModule } from "@/elasticsearch/elasticsearch.module";
import { SharedModule } from "@/shared/shared.module";
import { Post } from "@/posts/post.entity";
import { Event } from "@/events/event.entity";
import { User } from "@/authentication_module/better-auth/entities/users.entity";
import { UserProfile } from "@/profile/user-profile.entity";
import { CollegeInfo } from "@/college/college-info/college-info.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SearchIndex,
      Post,
      Event,
      User,
      UserProfile,
      CollegeInfo,
    ]),
    MyElasticsearchModule,
    SharedModule,
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchEventHandler, ReindexService],
  exports: [SearchService],
})
export class SearchIndexModule {}
