import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityHandle } from "./entity-handle.entity";
import { HandlesService } from "./handles.service";
import { HandlesController } from "./handles.controller";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import { MyElasticsearchModule } from "../elasticsearch/elasticsearch.module";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([EntityHandle, User, CollegeInfo]),
    MyElasticsearchModule,
  ],
  controllers: [HandlesController],
  providers: [HandlesService],
  exports: [HandlesService, TypeOrmModule],
})
export class HandlesModule {}
