import { Injectable, OnModuleInit, Logger, Inject } from "@nestjs/common";
import { SearchService } from "./search.service";
import { IEventBus, EVENT_BUS } from "@/shared/events";
import { SearchEntityType } from "@/common/enums";

interface SearchEventPayload {
  entityType: SearchEntityType;
  entityId: string;
  indexedText?: string;
}

/**
 * Event handler that listens for entity events and syncs to ElasticSearch
 */
@Injectable()
export class SearchEventHandler implements OnModuleInit {
  private readonly logger = new Logger(SearchEventHandler.name);

  constructor(
    private readonly searchService: SearchService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus
  ) {}

  async onModuleInit() {
    // Initialize ElasticSearch index
    await this.searchService.initializeIndex();

    // Subscribe to search index events
    this.eventBus.subscribe<any>("search.index.requested", async (event) => {
      const payload = event.payload as SearchEventPayload;
      await this.handleIndexRequest(payload);
    });

    this.eventBus.subscribe<any>("search.remove.requested", async (event) => {
      const payload = event.payload as SearchEventPayload;
      await this.handleRemoveRequest(payload);
    });

    // Subscribe to entity-specific events
    this.subscribeToEntityEvents();

    this.logger.log("Search event handler initialized");
  }

  private subscribeToEntityEvents() {
    // Post events
    this.eventBus.subscribe<any>("post.created", async (event) => {
      await this.searchService.indexEntity(
        SearchEntityType.POST,
        event.aggregateId,
        event.payload?.content || ""
      );
    });

    this.eventBus.subscribe<any>("post.updated", async (event) => {
      await this.searchService.indexEntity(
        SearchEntityType.POST,
        event.aggregateId,
        event.payload?.content || ""
      );
    });

    this.eventBus.subscribe<any>("post.deleted", async (event) => {
      await this.searchService.removeEntity(
        SearchEntityType.POST,
        event.aggregateId
      );
    });

    // Event (calendar) events
    this.eventBus.subscribe<any>("event.created", async (event) => {
      const text = `${event.payload?.title || ""} ${event.payload?.description || ""} ${event.payload?.location || ""}`;
      await this.searchService.indexEntity(
        SearchEntityType.EVENT,
        event.aggregateId,
        text.trim()
      );
    });

    this.eventBus.subscribe<any>("event.updated", async (event) => {
      const text = `${event.payload?.title || ""} ${event.payload?.description || ""} ${event.payload?.location || ""}`;
      await this.searchService.indexEntity(
        SearchEntityType.EVENT,
        event.aggregateId,
        text.trim()
      );
    });

    this.eventBus.subscribe<any>("event.deleted", async (event) => {
      await this.searchService.removeEntity(
        SearchEntityType.EVENT,
        event.aggregateId
      );
    });

    // User events
    this.eventBus.subscribe<any>("user.updated", async (event) => {
      const text = `${event.payload?.name || ""} ${event.payload?.bio || ""}`;
      await this.searchService.indexEntity(
        SearchEntityType.USER,
        event.aggregateId,
        text.trim()
      );
    });

    this.logger.log("Subscribed to entity events for search indexing");
  }

  private async handleIndexRequest(payload: SearchEventPayload) {
    if (!payload.indexedText) {
      this.logger.warn(
        `No indexed text for ${payload.entityType}:${payload.entityId}`
      );
      return;
    }
    await this.searchService.indexEntity(
      payload.entityType,
      payload.entityId,
      payload.indexedText
    );
  }

  private async handleRemoveRequest(payload: SearchEventPayload) {
    await this.searchService.removeEntity(payload.entityType, payload.entityId);
  }
}
