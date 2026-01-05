import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { IEventBus, EventHandler } from "./event-bus.interface";
import { DomainEvent } from "./domain-event";

/**
 * Redis-based implementation of the event bus.
 *
 * Uses Redis Pub/Sub for event distribution. In a monolith, this provides
 * reliable event delivery. When transitioning to microservices, this can be
 * replaced with Kafka, RabbitMQ, or any other message broker by implementing
 * the IEventBus interface.
 *
 * Architecture notes:
 * - Uses two Redis connections: one for publishing, one for subscribing
 * - Events are JSON-serialized before publishing
 * - Handlers are called asynchronously to avoid blocking
 */
@Injectable()
export class RedisEventBusService
  implements IEventBus, OnModuleInit, OnModuleDestroy
{
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private readonly handlers = new Map<string, Set<EventHandler<DomainEvent>>>();
  private readonly channelPrefix = "domain_events:";
  private subscriberReady = false;
  private readonly pendingSubscriptions: string[] = [];

  async onModuleInit() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || "3.7.69.199",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        retryStrategy: (times: number) => {
          if (times > 3) {
            console.error("Redis event bus: Max reconnection attempts reached");
            return null;
          }
          return Math.min(times * 100, 3000);
        },
      };

      this.publisher = new Redis(redisConfig);
      this.subscriber = new Redis(redisConfig);

      this.subscriber.on("message", (channel, message) => {
        this.handleMessage(channel, message);
      });

      this.publisher.on("connect", () => {
        console.log("[EventBus] Redis publisher connected");
      });

      // Use 'ready' event instead of 'connect' to avoid race condition
      this.subscriber.on("ready", () => {
        console.log("[EventBus] Redis subscriber ready");
        this.subscriberReady = true;
        this.processPendingSubscriptions();
      });

      this.publisher.on("error", (err) => {
        console.error("[EventBus] Redis publisher error:", err.message);
      });

      this.subscriber.on("error", (err) => {
        // Ignore subscriber mode errors during ready check
        if (!err.message.includes("subscriber mode")) {
          console.error("[EventBus] Redis subscriber error:", err.message);
        }
      });
    } catch (error) {
      console.error("[EventBus] Failed to initialize Redis:", error);
    }
  }

  /**
   * Process any subscriptions that were queued before subscriber was ready
   */
  private processPendingSubscriptions() {
    if (!this.subscriber || !this.subscriberReady) return;

    while (this.pendingSubscriptions.length > 0) {
      const channel = this.pendingSubscriptions.shift()!;
      this.subscriber.subscribe(channel, (err) => {
        if (err) {
          console.error(`[EventBus] Failed to subscribe to ${channel}:`, err);
        } else {
          const eventType = channel.replace(this.channelPrefix, "");
          console.log(`[EventBus] Subscribed to event: ${eventType}`);
        }
      });
    }
  }

  async onModuleDestroy() {
    await this.publisher?.quit();
    await this.subscriber?.quit();
  }

  /**
   * Publish a domain event to Redis
   */
  async publish<T extends DomainEvent>(event: T): Promise<void> {
    if (!this.publisher) {
      console.warn(
        "[EventBus] Publisher not available, event dropped:",
        event.eventType
      );
      return;
    }

    const channel = `${this.channelPrefix}${event.eventType}`;
    const message = JSON.stringify(event.toJSON());

    try {
      await this.publisher.publish(channel, message);
      console.log(
        `[EventBus] Published event: ${event.eventType} (${event.eventId})`
      );
    } catch (error) {
      console.error(
        `[EventBus] Failed to publish event: ${event.eventType}`,
        error
      );
    }
  }

  /**
   * Subscribe to a domain event type
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    const channel = `${this.channelPrefix}${eventType}`;

    // Add handler to local registry
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());

      // Queue or subscribe to Redis channel
      if (this.subscriber && this.subscriberReady) {
        this.subscriber.subscribe(channel, (err) => {
          if (err) {
            console.error(
              `[EventBus] Failed to subscribe to ${eventType}:`,
              err
            );
          } else {
            console.log(`[EventBus] Subscribed to event: ${eventType}`);
          }
        });
      } else {
        // Queue for later when subscriber is ready
        this.pendingSubscriptions.push(channel);
      }
    }

    this.handlers.get(eventType)!.add(handler as EventHandler<DomainEvent>);
  }

  /**
   * Unsubscribe a handler from an event type
   */
  unsubscribe(eventType: string, handler: EventHandler<DomainEvent>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);

      // If no more handlers, unsubscribe from Redis channel
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
        const channel = `${this.channelPrefix}${eventType}`;
        this.subscriber?.unsubscribe(channel);
      }
    }
  }

  /**
   * Handle incoming messages from Redis
   */
  private async handleMessage(channel: string, message: string): Promise<void> {
    const eventType = channel.replace(this.channelPrefix, "");
    const handlers = this.handlers.get(eventType);

    if (!handlers || handlers.size === 0) {
      return;
    }

    try {
      const eventData = JSON.parse(message);

      // Execute all handlers concurrently
      const handlerPromises = Array.from(handlers).map(async (handler) => {
        try {
          await handler(eventData);
        } catch (error) {
          console.error(
            `[EventBus] Handler error for event ${eventType}:`,
            error
          );
        }
      });

      await Promise.all(handlerPromises);
    } catch (error) {
      console.error(`[EventBus] Failed to parse event message:`, error);
    }
  }
}
