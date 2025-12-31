import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Notification, NotificationType } from "./notification.entity";
import { NotificationRepository } from "./notification.repository";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

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

    return this.notificationRepository.create({
      recipientId,
      actorId: actorId || null,
      type,
      title,
      message,
      data,
      link,
    });
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
