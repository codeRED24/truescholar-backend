/**
 * Post Domain Events
 *
 * Events emitted by the Content context when posts are modified.
 * Consumed by: Timeline, Notifications, Search
 */

import { DomainEvent } from "./domain-event.interface";
import { PostVisibility } from "../../posts/post.entity";

// =============================================================================
// Event Topics (Kafka topic names)
// =============================================================================

export const POST_EVENTS = {
  CREATED: "posts.post.created",
  UPDATED: "posts.post.updated",
  DELETED: "posts.post.deleted",
} as const;

// =============================================================================
// Event Payloads
// =============================================================================

export interface PostCreatedPayload {
  postId: string;
  authorId: string;
  content: string;
  visibility: PostVisibility;
  mediaCount: number;
  taggedCollegeId?: number;
}

export interface PostUpdatedPayload {
  postId: string;
  authorId: string;
  content?: string;
  visibility?: PostVisibility;
  /** Fields that changed */
  changedFields: string[];
}

export interface PostDeletedPayload {
  postId: string;
  authorId: string;
}

// =============================================================================
// Typed Events
// =============================================================================

export type PostCreatedEvent = DomainEvent<PostCreatedPayload>;
export type PostUpdatedEvent = DomainEvent<PostUpdatedPayload>;
export type PostDeletedEvent = DomainEvent<PostDeletedPayload>;

// Union type for all post events
export type PostEvent = PostCreatedEvent | PostUpdatedEvent | PostDeletedEvent;
