import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationsService } from "./notifications.service";
import { NotificationType } from "./notification.entity";

/**
 * Kafka Event Controller for handling notification-related events.
 * Replaces the old notification-event-handler.ts that used eventBus.subscribe()
 */
@Controller()
export class NotificationEventController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern("likes.post.liked")
  async handlePostLiked(@Payload() event: any) {
    const { postId, likerId, authorId } = event.payload || event;
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

  @EventPattern("comments.added")
  async handleCommentAdded(@Payload() event: any) {
    const { commentId, postId, authorId, postAuthorId } =
      event.payload || event;

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

  @EventPattern("likes.comment.liked")
  async handleCommentLiked(@Payload() event: any) {
    const { commentId, likerId, commentAuthorId } = event.payload || event;
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

  @EventPattern("follows.created")
  async handleNewFollower(@Payload() event: any) {
    const { followerId, followingId } = event.payload || event;

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
