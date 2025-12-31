import { DomainEvent } from "./domain-event";

/**
 * Event handler function type
 */
export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

/**
 * Interface for the event bus - the central nervous system of the modular monolith.
 *
 * This abstraction allows us to:
 * 1. Use Redis pub/sub in the monolith
 * 2. Swap to Kafka/RabbitMQ when transitioning to microservices
 * 3. Use in-memory for testing
 *
 * Modules publish events without knowing who consumes them, and subscribe
 * to events without knowing who publishes them. This is the key to decoupling.
 */
export interface IEventBus {
  /**
   * Publish a domain event to the event bus.
   * All registered handlers for this event type will be invoked.
   *
   * @param event - The domain event to publish
   */
  publish<T extends DomainEvent>(event: T): Promise<void>;

  /**
   * Subscribe to a specific event type.
   * The handler will be called whenever an event of this type is published.
   *
   * @param eventType - The type of event to subscribe to (e.g., 'post.created')
   * @param handler - The function to call when the event occurs
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void;

  /**
   * Unsubscribe a handler from an event type (optional, useful for cleanup)
   */
  unsubscribe(eventType: string, handler: EventHandler<DomainEvent>): void;
}

/**
 * Injection token for the event bus
 */
export const EVENT_BUS = Symbol("EVENT_BUS");
