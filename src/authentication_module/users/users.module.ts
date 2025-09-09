import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "./users.service";
import { UserController } from "./users.controller";
import { User } from "./users.entity";
import { OtpRequest } from "./user-otp.entity";
import { FileUploadService } from "../../utils/file-upload/fileUpload.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, OtpRequest])],
  controllers: [UserController],
  providers: [UserService, FileUploadService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
