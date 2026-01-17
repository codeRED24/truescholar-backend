/**
 * Social Graph Domain Events
 *
 * Events emitted when follow relationships change.
 * Consumed by: Timeline (for feed rebuilding), Notifications (for follow alerts)
 */

import { DomainEvent } from "./domain-event.interface";

// =============================================================================
// Event Topics (Kafka topic names)
// =============================================================================

export const SOCIAL_GRAPH_EVENTS = {
  USER_FOLLOWED: "social-graph.user.followed",
  USER_UNFOLLOWED: "social-graph.user.unfollowed",
  COLLEGE_FOLLOWED: "social-graph.college.followed",
  COLLEGE_UNFOLLOWED: "social-graph.college.unfollowed",
} as const;

// =============================================================================
// Event Payloads
// =============================================================================

export interface UserFollowedPayload {
  followerId: string;
  followingId: string;
  /** Follower's new total following count */
  followerFollowingCount: number;
  /** Followed user's new follower count */
  followingFollowerCount: number;
}

export interface UserUnfollowedPayload {
  followerId: string;
  followingId: string;
  followerFollowingCount: number;
  followingFollowerCount: number;
}

export interface CollegeFollowedPayload {
  userId: string;
  collegeId: number;
}

export interface CollegeUnfollowedPayload {
  userId: string;
  collegeId: number;
}

// =============================================================================
// Typed Events
// =============================================================================

export type UserFollowedEvent = DomainEvent<UserFollowedPayload>;
export type UserUnfollowedEvent = DomainEvent<UserUnfollowedPayload>;
export type CollegeFollowedEvent = DomainEvent<CollegeFollowedPayload>;
export type CollegeUnfollowedEvent = DomainEvent<CollegeUnfollowedPayload>;

// Union type for all social graph events
export type SocialGraphEvent =
  | UserFollowedEvent
  | UserUnfollowedEvent
  | CollegeFollowedEvent
  | CollegeUnfollowedEvent;
