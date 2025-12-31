import { Global, Module } from "@nestjs/common";
import { EVENT_BUS } from "./events/event-bus.interface";
import { RedisEventBusService } from "./events/redis-event-bus.service";

/**
 * Shared Kernel Module
 *
 * This module provides core shared services to all modules in the application.
 * It is marked as @Global so that other modules don't need to import it explicitly.
 *
 * Services provided:
 * - EventBus: For inter-module communication via domain events
 *
 * When transitioning to microservices:
 * - Replace RedisEventBusService with KafkaEventBusService or similar
 * - Each microservice will have its own SharedModule instance
 */
@Global()
@Module({
  providers: [
    {
      provide: EVENT_BUS,
      useClass: RedisEventBusService,
    },
  ],
  exports: [EVENT_BUS],
})
export class SharedModule {}
