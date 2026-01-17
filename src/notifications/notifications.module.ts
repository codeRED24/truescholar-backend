import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { UserDevice } from "./user-device.entity";
import { NotificationRepository } from "./notification.repository";
import { NotificationsService } from "./notifications.service";
import { FirebaseService } from "./firebase.service";
import { UserDevicesService } from "./user-devices.service";
import { NotificationsController } from "./notifications.controller";
import { UserDevicesController } from "./user-devices.controller";
import { NotificationEventController } from "./notification-event.controller";
import { EmailEventController } from "./email-event.controller";
import { PushNotificationConsumer } from "./push-notification.consumer";

@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserDevice])],
  controllers: [
    NotificationsController,
    UserDevicesController,
    NotificationEventController,
    EmailEventController,
    PushNotificationConsumer,
  ],
  providers: [
    NotificationRepository,
    NotificationsService,
    FirebaseService,
    UserDevicesService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
