import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SessionsService } from "./sessions.service";

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(private readonly sessionsService: SessionsService) {}

  @Cron(CronExpression.EVERY_12_HOURS) // Run every 12 hour
  async handleCron() {
    this.logger.log("Running session cleanup job...");
    const deletedCount = await this.sessionsService.deleteExpiredSessions();
    this.logger.log(`Cleaned up ${deletedCount} expired sessions.`);
  }
}
