import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CmsUser } from "./auth.entity";
import AuthService from "./auth.service";
import AuthController from "./auth.controller";
import { JwtCmsStrategy } from "./jwt.cmsStrategy";
import { Logs } from "../cms-logs/logs.entity";
import { LogsModule } from "../cms-logs/logs.module";
import { LogsService } from "../cms-logs/logs.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [TypeOrmModule.forFeature([CmsUser, Logs]), LogsModule],
  providers: [AuthService, JwtCmsStrategy, LogsService],
  controllers: [AuthController],
  exports: [TypeOrmModule, JwtService],
})
export class CmsAuthModule {}
