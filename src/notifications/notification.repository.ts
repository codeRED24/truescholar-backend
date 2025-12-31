import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification, NotificationType } from "./notification.entity";

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>
  ) {}

  async create(data: Partial<Notification>): Promise<Notification> {
    const notification = this.repo.create(data);
    return this.repo.save(notification);
  }

  async findById(id: string): Promise<Notification | null> {
    return this.repo.findOne({ where: { id } });
  }

  async getByRecipient(
    recipientId: string,
    page: number,
    limit: number
  ): Promise<Notification[]> {
    const skip = (page - 1) * limit;
    return this.repo.find({
      where: { recipientId },
      relations: ["actor"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });
  }

  async getUnreadByRecipient(recipientId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { recipientId, isRead: false },
      relations: ["actor"],
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  async countUnread(recipientId: string): Promise<number> {
    return this.repo.count({ where: { recipientId, isRead: false } });
  }

  async markAsRead(id: string): Promise<boolean> {
    const result = await this.repo.update(id, { isRead: true });
    return (result.affected ?? 0) > 0;
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await this.repo.update(
      { recipientId, isRead: false },
      { isRead: true }
    );
    return result.affected ?? 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async deleteOlderThan(days: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const result = await this.repo
      .createQueryBuilder()
      .delete()
      .where("createdAt < :date", { date })
      .execute();
    return result.affected ?? 0;
  }
}
