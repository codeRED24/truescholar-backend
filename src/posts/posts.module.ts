import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./post.entity";
import { PostRepository } from "./post.repository";
import { PostsService } from "./post.service";
import { PostsController } from "./posts.controller";
import { ConnectionsModule } from "src/connections/connections.module";
import { LikesModule } from "src/likes/likes.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    forwardRef(() => ConnectionsModule),
    forwardRef(() => LikesModule),
  ],
  controllers: [PostsController],
  providers: [PostRepository, PostsService],
  exports: [PostsService],
})
export class PostsModule {}
