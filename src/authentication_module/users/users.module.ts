import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "./users.service";
import { UserController } from "./users.controller";
import { User } from "./users.entity";
import { OtpRequest } from "./user-otp.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, OtpRequest])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
