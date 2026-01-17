import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  OnModuleInit,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { Notification, NotificationType } from "./notification.entity";
import { NotificationRepository } from "./notification.repository";
import { KAFKA_SERVICE } from "../shared/kafka/kafka.module";
import { Subject } from "rxjs";

export interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data: Record<string, any>;
  link?: string;
  retryCount?: number;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly notificationSubject = new Subject<{ userId: string; notification: Notification }>();

  constructor(
    private readonly notificationRepository: NotificationRepository,
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  // Stream for SSE
  getNotificationStream() {
    return this.notificationSubject.asObservable();
  }

  async createNotification(
    recipientId: string,
    type: NotificationType,
    title: string,
    message: string,
    data: Record<string, any> = {},
    actorId?: string,
    link?: string
  ): Promise<Notification> {
    // Don't notify yourself
    if (actorId && actorId === recipientId) {
      return null as any;
    }

    // 1. Save to DB
    const notification = await this.notificationRepository.create({
      recipientId,
      actorId: actorId || null,
      type,
      title,
      message,
      data,
      link,
    });

    // 2. Emit to real-time stream (SSE)
    this.notificationSubject.next({ userId: recipientId, notification });

    // 3. Emit to Kafka for push notification (async, with retry support)
    const payload: PushNotificationPayload = {
      userId: recipientId,
      title,
      body: message,
      data,
      link,
      retryCount: 0,
    };
    this.kafkaClient.emit("push.notification.send", payload);

    return notification;
  }

  async getNotifications(
    recipientId: string,
    page: number,
    limit: number
  ): Promise<Notification[]> {
    return this.notificationRepository.getByRecipient(recipientId, page, limit);
  }

  async getUnreadNotifications(recipientId: string): Promise<Notification[]> {
    return this.notificationRepository.getUnreadByRecipient(recipientId);
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return this.notificationRepository.countUnread(recipientId);
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification =
      await this.notificationRepository.findById(notificationId);
    if (!notification) throw new NotFoundException("Notification not found");
    if (notification.recipientId !== userId)
      throw new ForbiddenException("Not your notification");
    await this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<void> {
    const notification =
      await this.notificationRepository.findById(notificationId);
    if (!notification) throw new NotFoundException("Notification not found");
    if (notification.recipientId !== userId)
      throw new ForbiddenException("Not your notification");
    await this.notificationRepository.delete(notificationId);
  }

  // Cleanup old notifications (can be called by a cron job)
  async cleanupOldNotifications(days: number = 30): Promise<number> {
    return this.notificationRepository.deleteOlderThan(days);
  }
}
