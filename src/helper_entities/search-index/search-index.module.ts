import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SearchIndex } from "./search-index.entity";
import { SearchService } from "./search.service";
import { SearchController } from "./search.controller";
import { SearchEventController } from "./search-event.controller";
import { ReindexService } from "./reindex.service";
import { MyElasticsearchModule } from "@/elasticsearch/elasticsearch.module";
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
  ],
  controllers: [SearchController, SearchEventController],
  providers: [SearchService, ReindexService],
  exports: [SearchService],
})
export class SearchIndexModule {}
