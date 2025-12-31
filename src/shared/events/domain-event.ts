import { randomUUID } from "crypto";

/**
 * Base class for all domain events in the system.
 * Domain events represent something that happened in the domain that other parts
 * of the system might be interested in.
 *
 * When transitioning to microservices, these events will be serialized and
 * published to a message broker (Kafka, RabbitMQ, etc.)
 */
export abstract class DomainEvent {
  /**
   * Unique identifier for this event instance
   */
  readonly eventId: string;

  /**
   * Timestamp when this event occurred
   */
  readonly occurredAt: Date;

  /**
   * ID of the aggregate/entity that this event is about
   */
  readonly aggregateId: string;

  /**
   * Type identifier for the event (e.g., 'post.created', 'connection.requested')
   * Used for routing and deserialization
   */
  abstract readonly eventType: string;

  constructor(aggregateId: string) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
    this.aggregateId = aggregateId;
  }

  /**
   * Serialize the event for transport
   */
  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      occurredAt: this.occurredAt.toISOString(),
      aggregateId: this.aggregateId,
      payload: this.getPayload(),
    };
  }

  /**
   * Get the event-specific payload data
   * Subclasses should override this to include their specific data
   */
  protected abstract getPayload(): Record<string, unknown>;
}
