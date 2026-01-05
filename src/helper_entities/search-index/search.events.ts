import { DomainEvent } from "@/shared/events/domain-event";
import { SearchEntityType } from "@/common/enums";

/**
 * Event emitted when an entity should be indexed for search
 */
export class EntityIndexRequestedEvent extends DomainEvent {
  readonly eventType = "search.index.requested";

  constructor(
    public readonly entityType: SearchEntityType,
    public readonly entityId: string,
    public readonly indexedText: string
  ) {
    super(entityId);
  }

  protected getPayload(): Record<string, unknown> {
    return {
      entityType: this.entityType,
      entityId: this.entityId,
      indexedText: this.indexedText,
    };
  }
}

/**
 * Event emitted when an entity should be removed from the search index
 */
export class EntityRemoveRequestedEvent extends DomainEvent {
  readonly eventType = "search.remove.requested";

  constructor(
    public readonly entityType: SearchEntityType,
    public readonly entityId: string
  ) {
    super(entityId);
  }

  protected getPayload(): Record<string, unknown> {
    return {
      entityType: this.entityType,
      entityId: this.entityId,
    };
  }
}
