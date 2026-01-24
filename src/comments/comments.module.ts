import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./comment.entity";
import { CommentRepository } from "./comment.repository";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { PostsModule } from "../posts/posts.module";
import { LikesModule } from "src/likes/likes.module";
import { CollegeMemberModule } from "src/college-member/college-member.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    forwardRef(() => PostsModule),
    forwardRef(() => LikesModule),
    CollegeMemberModule,
  ],
  controllers: [CommentsController],
  providers: [CommentRepository, CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
