import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { Review } from "./entities/review.entity";
import { User } from "../authentication_module/users/users.entity";
import { UserModule } from "../authentication_module/users/users.module";
import { FileUploadService } from "../utils/file-upload/fileUpload.service";

@Module({
  imports: [TypeOrmModule.forFeature([Review, User]), UserModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, FileUploadService],
})
export class ReviewsModule {}
