import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationsService } from "./notifications.service";
import { NotificationType } from "./notification.entity";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import { Member } from "../authentication_module/better-auth/entities/member.entity";
import { AuthorType, CollegeRole } from "../common/enums";
import {
  ENGAGEMENT_EVENTS,
  PostLikedEvent,
  CommentLikedEvent,
  COMMENT_EVENTS,
  CommentCreatedEvent,
  SOCIAL_GRAPH_EVENTS,
  UserFollowedEvent,
  CollegeFollowedEvent,
} from "../shared/events";

/**
 * Kafka Event Controller for handling notification-related events.
 * Replaces the old notification-event-handler.ts that used eventBus.subscribe()
 */
@Controller()
export class NotificationEventController {
  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CollegeInfo)
    private readonly collegeRepository: Repository<CollegeInfo>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>
  ) {}

  /**
   * Helper to resolve actor name (User or College)
   */
  private async getActorName(
    actorId: string,
    authorType?: AuthorType,
    collegeId?: number | null
  ): Promise<string> {
    try {
      if (authorType === AuthorType.COLLEGE && collegeId) {
        const college = await this.collegeRepository.findOne({
          where: { college_id: collegeId },
          select: ["college_name", "short_name"],
        });
        return college?.short_name || college?.college_name || "A College";
      }

      const user = await this.userRepository.findOne({
        where: { id: actorId },
        select: ["name"],
      });
      return user?.name || "Someone";
    } catch (error) {
      console.error("Error fetching actor name:", error);
      return "Someone";
    }
  }

  @EventPattern(ENGAGEMENT_EVENTS.POST_LIKED)
  async handlePostLiked(@Payload() event: PostLikedEvent) {
    const { postId, likerId, authorId, authorType, collegeId } = event.payload;
    if (likerId === authorId) return;

    const actorName = await this.getActorName(likerId, authorType, collegeId);

    await this.notificationsService.createNotification(
      authorId,
      NotificationType.POST_LIKED,
      "Post Liked",
      `${actorName} liked your post`,
      { postId },
      likerId,
      `/posts/${postId}`
    );
  }

  @EventPattern(COMMENT_EVENTS.CREATED)
  async handleCommentAdded(@Payload() event: CommentCreatedEvent) {
    const {
      commentId,
      postId,
      authorId,
      postAuthorId,
      authorType,
      collegeId,
    } = event.payload;

    if (authorId !== postAuthorId) {
      const actorName = await this.getActorName(authorId, authorType, collegeId);

      await this.notificationsService.createNotification(
        postAuthorId,
        NotificationType.POST_COMMENTED,
        "New Comment",
        `${actorName} commented on your post`,
        { postId, commentId },
        authorId,
        `/posts/${postId}`
      );
    }
  }

  @EventPattern(ENGAGEMENT_EVENTS.COMMENT_LIKED)
  async handleCommentLiked(@Payload() event: CommentLikedEvent) {
    const {
      commentId,
      likerId,
      commentAuthorId,
      authorType,
      collegeId,
    } = event.payload;

    if (likerId === commentAuthorId) return;

    const actorName = await this.getActorName(likerId, authorType, collegeId);

    await this.notificationsService.createNotification(
      commentAuthorId,
      NotificationType.COMMENT_LIKED,
      "Comment Liked",
      `${actorName} liked your comment`,
      { commentId },
      likerId
    );
  }

  @EventPattern("connections.requested")
  async handleConnectionRequested(@Payload() event: any) {
    const { connectionId, requesterId, addresseeId } = event.payload || event;

    const actorName = await this.getActorName(requesterId);

    await this.notificationsService.createNotification(
      addresseeId,
      NotificationType.CONNECTION_REQUESTED,
      "Connection Request",
      `${actorName} wants to connect with you`,
      { connectionId },
      requesterId,
      "/network"
    );
  }

  @EventPattern("connections.accepted")
  async handleConnectionAccepted(@Payload() event: any) {
    const { connectionId, requesterId, addresseeId } = event.payload || event;

    // requesterId is the one who sent the request (User A)
    // addresseeId is the one who accepted (User B)
    // We are notifying User A that User B accepted.
    const actorName = await this.getActorName(addresseeId);

    await this.notificationsService.createNotification(
      requesterId,
      NotificationType.CONNECTION_ACCEPTED,
      "Connection Accepted",
      `${actorName} accepted your connection request`,
      { connectionId },
      addresseeId,
      "/network"
    );
  }

  @EventPattern(SOCIAL_GRAPH_EVENTS.USER_FOLLOWED)
  async handleNewFollower(@Payload() event: UserFollowedEvent) {
    const {
      followerId,
      followingId,
      authorType,
      followerCollegeId,
    } = event.payload;

    const actorName = await this.getActorName(
      followerId,
      authorType,
      followerCollegeId
    );

    await this.notificationsService.createNotification(
      followingId,
      NotificationType.NEW_FOLLOWER,
      "New Follower",
      `${actorName} started following you`,
      {},
      followerId,
      `/profile/${followerId}`
    );
  }

  @EventPattern(SOCIAL_GRAPH_EVENTS.COLLEGE_FOLLOWED)
  async handleCollegeFollowed(@Payload() event: CollegeFollowedEvent) {
    const { userId, collegeId, authorType, followerCollegeId } = event.payload;

    // Resolve who is following (User or College)
    const actorName = await this.getActorName(
      userId,
      authorType,
      followerCollegeId
    );

    // Find all admins of the followed college
    const admins = await this.memberRepository.find({
      where: {
        collegeId,
        role: CollegeRole.COLLEGE_ADMIN,
      },
      select: ["userId"],
    });

    // Notify each admin
    for (const admin of admins) {
      await this.notificationsService.createNotification(
        admin.userId,
        NotificationType.NEW_FOLLOWER,
        "New Follower",
        `${actorName} started following your college`,
        { collegeId },
        userId,
        `/college/${collegeId}/followers` // Or dashboard link
      );
    }
  }

  @EventPattern("jobs.application.submitted")
  async handleApplicationSubmitted(@Payload() event: any) {
    const { applicationId, jobId, applicantId, posterId } =
      event.payload || event;

    // Applicants are always users
    const actorName = await this.getActorName(applicantId);

    await this.notificationsService.createNotification(
      posterId,
      NotificationType.JOB_APPLICATION_RECEIVED,
      "New Application",
      `${actorName} applied to your job posting`,
      { applicationId, jobId },
      applicantId,
      `/jobs/${jobId}/applications`
    );
  }

  @EventPattern("jobs.application.status_changed")
  async handleApplicationStatusChanged(@Payload() event: any) {
    const { applicationId, applicantId, newStatus, jobTitle } =
      event.payload || event;

    // Notification comes from system/recruiter, but here we just update status
    // We can keep the message as is or make it generic "Your application..."
    // as the "actor" is implicit (the company/college)

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
