import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Session } from "./sessions.entity";
import { SessionsService } from "./sessions.service";
import { SessionCleanupService } from "./session-cleanup.service";

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  providers: [SessionsService, SessionCleanupService],
  exports: [SessionsService],
})
export class SessionsModule {}
