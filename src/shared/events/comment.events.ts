/**
 * Comment Domain Events
 *
 * Events emitted when comments are created or deleted.
 * Consumed by: Timeline (for comment count updates), Notifications
 */

import { DomainEvent } from "./domain-event.interface";
import { AuthorType } from "../../common/enums";

// =============================================================================
// Event Topics (Kafka topic names)
// =============================================================================

export const COMMENT_EVENTS = {
  CREATED: "content.comment.created",
  DELETED: "content.comment.deleted",
} as const;

// =============================================================================
// Event Payloads
// =============================================================================

export interface CommentCreatedPayload {
  commentId: string;
  postId: string;
  authorId: string;
  postAuthorId: string;
  parentId: string | null;
  /** New comment count on the post */
  postCommentCount: number;
  authorType: AuthorType;
  collegeId: number | null;
}

export interface CommentDeletedPayload {
  commentId: string;
  postId: string;
  authorId: string;
  postCommentCount: number;
}

// =============================================================================
// Typed Events
// =============================================================================

export type CommentCreatedEvent = DomainEvent<CommentCreatedPayload>;
export type CommentDeletedEvent = DomainEvent<CommentDeletedPayload>;

// Union type for all comment events
export type CommentEvent = CommentCreatedEvent | CommentDeletedEvent;
