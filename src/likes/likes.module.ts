import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Like } from "./like.entity";
import { LikeRepository } from "./like.repository";
import { LikesService } from "./likes.service";
import { PostsModule } from "../posts/posts.module";
import { CommentsModule } from "../comments/comments.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Like]),
    forwardRef(() => PostsModule),
    forwardRef(() => CommentsModule),
  ],
  providers: [LikeRepository, LikesService],
  exports: [LikesService],
})
export class LikesModule {}
