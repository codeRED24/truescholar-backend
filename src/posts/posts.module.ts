import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./post.entity";
import { PostRepository } from "./post.repository";
import { PostsService } from "./post.service";
import { PostsController } from "./posts.controller";
import { LikesModule } from "src/likes/likes.module";
import { FollowersModule } from "src/followers/followers.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    forwardRef(() => LikesModule),
    forwardRef(() => FollowersModule),
  ],
  controllers: [PostsController],
  providers: [PostRepository, PostsService],
  exports: [PostsService],
})
export class PostsModule {}
