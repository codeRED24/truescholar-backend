import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Sse,
  MessageEvent,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";
import { NotificationsService } from "./notifications.service";
import { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";

class PaginationDto {
  page?: number = 1;
  limit?: number = 20;
}

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse("stream")
  @ApiOperation({ summary: "Real-time notification stream (SSE)" })
  streamNotifications(@User() user: { id: string }): Observable<MessageEvent> {
    return this.notificationsService.getNotificationStream().pipe(
      filter((payload) => payload.userId === user.id),
      map((payload) => ({
        data: this.mapToResponse(payload.notification),
      } as MessageEvent))
    );
  }

  @Get()
  @ApiOperation({ summary: "Get all notifications" })
  async getNotifications(
    @User() user: { id: string },
    @Query() query: PaginationDto
  ) {
    const notifications = await this.notificationsService.getNotifications(
      user.id,
      query.page || 1,
      Math.min(query.limit || 20, 50)
    );
    return notifications.map((n) => this.mapToResponse(n));
  }

  @Get("unread")
  @ApiOperation({ summary: "Get unread notifications" })
  async getUnreadNotifications(@User() user: { id: string }) {
    const notifications =
      await this.notificationsService.getUnreadNotifications(user.id);
    return notifications.map((n) => this.mapToResponse(n));
  }

  @Get("unread/count")
  @ApiOperation({ summary: "Get unread notification count" })
  async getUnreadCount(@User() user: { id: string }) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { count };
  }

  @Post(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  async markAsRead(
    @User() user: { id: string },
    @Param("id") notificationId: string
  ) {
    await this.notificationsService.markAsRead(notificationId, user.id);
    return { success: true };
  }

  @Post("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  async markAllAsRead(@User() user: { id: string }) {
    const count = await this.notificationsService.markAllAsRead(user.id);
    return { success: true, count };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a notification" })
  async deleteNotification(
    @User() user: { id: string },
    @Param("id") notificationId: string
  ) {
    await this.notificationsService.deleteNotification(notificationId, user.id);
    return { success: true };
  }

  private mapToResponse(notification: any) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      link: notification.link,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      actor: notification.actor
        ? {
            id: notification.actor.id,
            name: notification.actor.name,
            image: notification.actor.image,
          }
        : null,
    };
  }
}
