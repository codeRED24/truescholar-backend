import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { UserProfile } from "./user-profile.entity";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { FileUploadService } from "../utils/file-upload/fileUpload.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile, User])],
  controllers: [ProfileController],
  providers: [ProfileService, FileUploadService],
  exports: [ProfileService],
})
export class ProfileModule {}
