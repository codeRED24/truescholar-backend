/**
 * Engagement Domain Events
 *
 * Events emitted when users interact with content (likes, bookmarks, etc.)
 * Consumed by: Timeline (for cache updates), Notifications (for alerts)
 */

import { DomainEvent } from "./domain-event.interface";
import { AuthorType } from "../../common/enums";

// =============================================================================
// Event Topics (Kafka topic names)
// =============================================================================

export const ENGAGEMENT_EVENTS = {
  POST_LIKED: "engagement.post.liked",
  POST_UNLIKED: "engagement.post.unliked",
  COMMENT_LIKED: "engagement.comment.liked",
  COMMENT_UNLIKED: "engagement.comment.unliked",
  POST_BOOKMARKED: "engagement.post.bookmarked",
  POST_UNBOOKMARKED: "engagement.post.unbookmarked",
} as const;

// =============================================================================
// Event Payloads
// =============================================================================

export interface PostLikedPayload {
  postId: string;
  likerId: string;
  authorId: string;
  /** New total like count */
  likeCount: number;
  authorType: AuthorType;
  collegeId: number | null;
}

export interface PostUnlikedPayload {
  postId: string;
  userId: string;
  /** New total like count */
  likeCount: number;
  authorType: AuthorType;
  collegeId: number | null;
}

export interface CommentLikedPayload {
  commentId: string;
  postId: string;
  likerId: string;
  commentAuthorId: string;
  likeCount: number;
  authorType: AuthorType;
  collegeId: number | null;
}

export interface CommentUnlikedPayload {
  commentId: string;
  postId: string;
  userId: string;
  likeCount: number;
  authorType: AuthorType;
  collegeId: number | null;
}

export interface PostBookmarkedPayload {
  postId: string;
  userId: string;
}

export interface PostUnbookmarkedPayload {
  postId: string;
  userId: string;
}

// =============================================================================
// Typed Events
// =============================================================================

export type PostLikedEvent = DomainEvent<PostLikedPayload>;
export type PostUnlikedEvent = DomainEvent<PostUnlikedPayload>;
export type CommentLikedEvent = DomainEvent<CommentLikedPayload>;
export type CommentUnlikedEvent = DomainEvent<CommentUnlikedPayload>;
export type PostBookmarkedEvent = DomainEvent<PostBookmarkedPayload>;
export type PostUnbookmarkedEvent = DomainEvent<PostUnbookmarkedPayload>;

// Union type for all engagement events
export type EngagementEvent =
  | PostLikedEvent
  | PostUnlikedEvent
  | CommentLikedEvent
  | CommentUnlikedEvent
  | PostBookmarkedEvent
  | PostUnbookmarkedEvent;
