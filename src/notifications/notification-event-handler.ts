import { Injectable, OnModuleInit } from "@nestjs/common";
import { IEventBus, EVENT_BUS } from "../shared/events";
import { Inject } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { NotificationType } from "./notification.entity";

/**
 * Event Handler that listens to domain events and creates notifications
 */
@Injectable()
export class NotificationEventHandler implements OnModuleInit {
  constructor(
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    private readonly notificationsService: NotificationsService
  ) {}

  async onModuleInit() {
    // Subscribe to social events
    await this.eventBus.subscribe(
      "likes.post.liked",
      this.handlePostLiked.bind(this)
    );
    await this.eventBus.subscribe(
      "comments.added",
      this.handleCommentAdded.bind(this)
    );
    await this.eventBus.subscribe(
      "likes.comment.liked",
      this.handleCommentLiked.bind(this)
    );
    await this.eventBus.subscribe(
      "connections.requested",
      this.handleConnectionRequested.bind(this)
    );
    await this.eventBus.subscribe(
      "connections.accepted",
      this.handleConnectionAccepted.bind(this)
    );
    await this.eventBus.subscribe(
      "follows.created",
      this.handleNewFollower.bind(this)
    );

    // Subscribe to job events
    await this.eventBus.subscribe(
      "jobs.application.submitted",
      this.handleApplicationSubmitted.bind(this)
    );
    await this.eventBus.subscribe(
      "jobs.application.status_changed",
      this.handleApplicationStatusChanged.bind(this)
    );
  }

  // Social Event Handlers
  private async handlePostLiked(event: any) {
    const { postId, likerId, authorId } = event;
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

  private async handleCommentAdded(event: any) {
    const { commentId, postId, authorId, postAuthorId, parentCommentId } =
      event;

    if (parentCommentId) {
      // This is a reply - would need to look up parent comment author
      // For now, just notify the post author
    }

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

  private async handleCommentLiked(event: any) {
    const { commentId, likerId, commentAuthorId } = event;
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

  private async handleConnectionRequested(event: any) {
    const { connectionId, requesterId, addresseeId } = event.payload;

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

  private async handleConnectionAccepted(event: any) {
    const { connectionId, requesterId, addresseeId } = event;

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

  private async handleNewFollower(event: any) {
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

  // Job Event Handlers
  private async handleApplicationSubmitted(event: any) {
    const { applicationId, jobId, applicantId, posterId } = event;

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

  private async handleApplicationStatusChanged(event: any) {
    const { applicationId, applicantId, newStatus, jobTitle } = event;

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
