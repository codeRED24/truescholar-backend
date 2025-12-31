import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { NotificationRepository } from "./notification.repository";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { NotificationEventHandler } from "./notification-event-handler";
import { EmailEventHandler } from "./email-event.handler";

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationRepository,
    NotificationsService,
    NotificationEventHandler,
    EmailEventHandler,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
