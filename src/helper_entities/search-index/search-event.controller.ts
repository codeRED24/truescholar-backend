import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { SearchService } from "./search.service";
import { SearchEntityType } from "@/common/enums";

/**
 * Kafka Event Controller for handling search index events.
 * Replaces the old search-event.handler.ts that used eventBus.subscribe()
 */
@Controller()
export class SearchEventController {
  private readonly logger = new Logger(SearchEventController.name);

  constructor(private readonly searchService: SearchService) {}

  @EventPattern("post.created")
  async handlePostCreated(@Payload() event: any) {
    await this.searchService.indexEntity(
      SearchEntityType.POST,
      event.aggregateId,
      event.payload?.content || ""
    );
  }

  @EventPattern("post.updated")
  async handlePostUpdated(@Payload() event: any) {
    await this.searchService.indexEntity(
      SearchEntityType.POST,
      event.aggregateId,
      event.payload?.content || ""
    );
  }

  @EventPattern("post.deleted")
  async handlePostDeleted(@Payload() event: any) {
    await this.searchService.removeEntity(
      SearchEntityType.POST,
      event.aggregateId
    );
  }

  @EventPattern("event.created")
  async handleEventCreated(@Payload() event: any) {
    const text = `${event.payload?.title || ""} ${event.payload?.description || ""} ${event.payload?.location || ""}`;
    await this.searchService.indexEntity(
      SearchEntityType.EVENT,
      event.aggregateId,
      text.trim()
    );
  }

  @EventPattern("event.updated")
  async handleEventUpdated(@Payload() event: any) {
    const text = `${event.payload?.title || ""} ${event.payload?.description || ""} ${event.payload?.location || ""}`;
    await this.searchService.indexEntity(
      SearchEntityType.EVENT,
      event.aggregateId,
      text.trim()
    );
  }

  @EventPattern("event.deleted")
  async handleEventDeleted(@Payload() event: any) {
    await this.searchService.removeEntity(
      SearchEntityType.EVENT,
      event.aggregateId
    );
  }

  @EventPattern("user.updated")
  async handleUserUpdated(@Payload() event: any) {
    const text = `${event.payload?.name || ""} ${event.payload?.bio || ""}`;
    await this.searchService.indexEntity(
      SearchEntityType.USER,
      event.aggregateId,
      text.trim()
    );
  }

  @EventPattern("search.index.requested")
  async handleIndexRequest(@Payload() event: any) {
    const { entityType, entityId, indexedText } = event.payload || event;
    if (!indexedText) {
      this.logger.warn(`No indexed text for ${entityType}:${entityId}`);
      return;
    }
    await this.searchService.indexEntity(entityType, entityId, indexedText);
  }

  @EventPattern("search.remove.requested")
  async handleRemoveRequest(@Payload() event: any) {
    const { entityType, entityId } = event.payload || event;
    await this.searchService.removeEntity(entityType, entityId);
  }
}
