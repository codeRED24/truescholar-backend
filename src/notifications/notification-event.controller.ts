import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationsService } from "./notifications.service";
import { NotificationType } from "./notification.entity";
import {
  ENGAGEMENT_EVENTS,
  PostLikedEvent,
  CommentLikedEvent,
  COMMENT_EVENTS,
  CommentCreatedEvent,
  SOCIAL_GRAPH_EVENTS,
  UserFollowedEvent,
} from "../shared/events";

/**
 * Kafka Event Controller for handling notification-related events.
 * Replaces the old notification-event-handler.ts that used eventBus.subscribe()
 */
@Controller()
export class NotificationEventController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(ENGAGEMENT_EVENTS.POST_LIKED)
  async handlePostLiked(@Payload() event: PostLikedEvent) {
    const { postId, likerId, authorId } = event.payload;
    if (likerId === authorId) return;

    await this.notificationsService.createNotification(
      authorId,
      NotificationType.POST_LIKED,
      "Post Liked",
      "Someone liked your post",
      { postId },
      likerId,
      `/posts/${postId}`
    );
  }

  @EventPattern(COMMENT_EVENTS.CREATED)
  async handleCommentAdded(@Payload() event: CommentCreatedEvent) {
    const { commentId, postId, authorId, postAuthorId } = event.payload;

    if (authorId !== postAuthorId) {
      await this.notificationsService.createNotification(
        postAuthorId,
        NotificationType.POST_COMMENTED,
        "New Comment",
        "Someone commented on your post",
        { postId, commentId },
        authorId,
        `/posts/${postId}`
      );
    }
  }

  @EventPattern(ENGAGEMENT_EVENTS.COMMENT_LIKED)
  async handleCommentLiked(@Payload() event: CommentLikedEvent) {
    const { commentId, likerId, commentAuthorId } = event.payload;
    if (likerId === commentAuthorId) return;

    await this.notificationsService.createNotification(
      commentAuthorId,
      NotificationType.COMMENT_LIKED,
      "Comment Liked",
      "Someone liked your comment",
      { commentId },
      likerId
    );
  }

  @EventPattern("connections.requested")
  async handleConnectionRequested(@Payload() event: any) {
    const { connectionId, requesterId, addresseeId } = event.payload || event;

    await this.notificationsService.createNotification(
      addresseeId,
      NotificationType.CONNECTION_REQUESTED,
      "Connection Request",
      "Someone wants to connect with you",
      { connectionId },
      requesterId,
      "/network"
    );
  }

  @EventPattern("connections.accepted")
  async handleConnectionAccepted(@Payload() event: any) {
    const { connectionId, requesterId, addresseeId } = event.payload || event;

    await this.notificationsService.createNotification(
      requesterId,
      NotificationType.CONNECTION_ACCEPTED,
      "Connection Accepted",
      "Your connection request was accepted",
      { connectionId },
      addresseeId,
      "/network"
    );
  }

  @EventPattern(SOCIAL_GRAPH_EVENTS.USER_FOLLOWED)
  async handleNewFollower(@Payload() event: UserFollowedEvent) {
    const { followerId, followingId } = event.payload;

    await this.notificationsService.createNotification(
      followingId,
      NotificationType.NEW_FOLLOWER,
      "New Follower",
      "Someone started following you",
      {},
      followerId,
      `/profile/${followerId}`
    );
  }

  @EventPattern("jobs.application.submitted")
  async handleApplicationSubmitted(@Payload() event: any) {
    const { applicationId, jobId, applicantId, posterId } =
      event.payload || event;

    await this.notificationsService.createNotification(
      posterId,
      NotificationType.JOB_APPLICATION_RECEIVED,
      "New Application",
      "Someone applied to your job posting",
      { applicationId, jobId },
      applicantId,
      `/jobs/${jobId}/applications`
    );
  }

  @EventPattern("jobs.application.status_changed")
  async handleApplicationStatusChanged(@Payload() event: any) {
    const { applicationId, applicantId, newStatus, jobTitle } =
      event.payload || event;

    await this.notificationsService.createNotification(
      applicantId,
      NotificationType.APPLICATION_STATUS_CHANGED,
      "Application Update",
      `Your application for "${jobTitle}" status changed to ${newStatus}`,
      { applicationId, status: newStatus },
      undefined,
      "/jobs/applications/my"
    );
  }
}
