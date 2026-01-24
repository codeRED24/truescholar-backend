import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./post.entity";
import { PostMediaUpload } from "./post-media-upload.entity";
import { PostRepository } from "./post.repository";
import { PostsService } from "./post.service";
import { PostsController } from "./posts.controller";
import { LikesModule } from "src/likes/likes.module";
import { FollowersModule } from "src/followers/followers.module";
import { FileUploadService } from "src/utils/file-upload/fileUpload.service";
import { HandlesModule } from "src/handles/handles.module";
import { CollegeMemberModule } from "src/college-member/college-member.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostMediaUpload]),
    forwardRef(() => LikesModule),
    forwardRef(() => FollowersModule),
    HandlesModule,
    CollegeMemberModule,
  ],
  controllers: [PostsController],
  providers: [PostRepository, PostsService, FileUploadService],
  exports: [PostsService],
})
export class PostsModule {}
