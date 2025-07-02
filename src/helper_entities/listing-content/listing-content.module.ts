import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListingContentService } from "./listing-content.service";
import { ListingContentController } from "./listing-content.controller";
import { ListingContent } from "./listing-content.entity";
import { City } from "../cities/city.entity";
import { State } from "../state/state.entity";
import { Stream } from "../stream/stream.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ListingContent,
      City,
      State,
      Stream,
      CourseGroup,
    ]),
  ],
  controllers: [ListingContentController],
  providers: [ListingContentService],
})
export class ListingContentModule {}
