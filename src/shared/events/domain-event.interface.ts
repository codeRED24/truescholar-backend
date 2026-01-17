/**
 * Domain Events - Base Interfaces and Types
 *
 * All domain events in the system follow this structure.
 * Events are immutable records of something that happened.
 */

/**
 * Base interface for all domain events
 */
export interface DomainEvent<T = unknown> {
  /** Unique identifier for this event instance */
  eventId: string;

  /** Event type in format: context.entity.action (e.g., "posts.post.created") */
  eventType: string;

  /** ID of the aggregate root this event relates to */
  aggregateId: string;

  /** ISO timestamp when the event occurred */
  occurredAt: string;

  /** Event-specific payload */
  payload: T;
}

/**
 * Event metadata for tracing and debugging
 */
export interface EventMetadata {
  /** Correlation ID for request tracing */
  correlationId?: string;

  /** User who triggered the event */
  triggeredBy?: string;

  /** Source service/module */
  source?: string;
}

/**
 * Helper to create a domain event
 */
export function createDomainEvent<T>(
  eventType: string,
  aggregateId: string,
  payload: T,
  metadata?: EventMetadata
): DomainEvent<T> {
  return {
    eventId: crypto.randomUUID(),
    eventType,
    aggregateId,
    occurredAt: new Date().toISOString(),
    payload,
    ...metadata,
  };
}
