import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { NotificationRepository } from "./notification.repository";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { NotificationEventController } from "./notification-event.controller";
import { EmailEventController } from "./email-event.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [
    NotificationsController,
    NotificationEventController,
    EmailEventController,
  ],
  providers: [NotificationRepository, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
