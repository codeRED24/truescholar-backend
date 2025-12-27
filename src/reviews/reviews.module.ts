import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewsService } from "./reviews.service";
import { ReviewsController } from "./reviews.controller";
import { Review } from "./entities/review.entity";
import { FileUploadService } from "../utils/file-upload/fileUpload.service";
import { User } from "../authentication_module/better-auth/entities";

@Module({
  imports: [TypeOrmModule.forFeature([Review, User])],
  controllers: [ReviewsController],
  providers: [ReviewsService, FileUploadService],
})
export class ReviewsModule {}
