import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchIndex } from "./search-index.entity";
import { SearchEntityType } from "@/common/enums";

const SEARCH_INDEX_NAME = "truescholar_search";

export interface SearchResult {
  entityType: SearchEntityType;
  entityId: string;
  text: string;
  score: number;
}

export interface SearchResponse {
  data: SearchResult[];
  total: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(SearchIndex)
    private readonly searchIndexRepository: Repository<SearchIndex>,
    private readonly elasticsearchService: ElasticsearchService
  ) {}

  /**
   * Initialize the ElasticSearch index with proper mappings
   */
  async initializeIndex(): Promise<void> {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: SEARCH_INDEX_NAME,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: SEARCH_INDEX_NAME,
          body: {
            mappings: {
              properties: {
                entityType: { type: "keyword" },
                entityId: { type: "keyword" },
                indexedText: {
                  type: "text",
                  analyzer: "standard",
                  fields: {
                    autocomplete: {
                      type: "text",
                      analyzer: "autocomplete",
                    },
                  },
                },
                createdAt: { type: "date" },
                updatedAt: { type: "date" },
              },
            },
            settings: {
              analysis: {
                analyzer: {
                  autocomplete: {
                    type: "custom",
                    tokenizer: "autocomplete",
                    filter: ["lowercase"],
                  },
                },
                tokenizer: {
                  autocomplete: {
                    type: "edge_ngram",
                    min_gram: 2,
                    max_gram: 20,
                    token_chars: ["letter", "digit"],
                  },
                },
              },
            },
          },
        });
        this.logger.log(`Created ElasticSearch index: ${SEARCH_INDEX_NAME}`);
      }
    } catch (error) {
      this.logger.error("Failed to initialize ElasticSearch index", error);
    }
  }

  /**
   * Index an entity to ElasticSearch and database
   */
  async indexEntity(
    entityType: SearchEntityType,
    entityId: string,
    indexedText: string
  ): Promise<void> {
    const now = new Date();

    try {
      // Index to ElasticSearch
      await this.elasticsearchService.index({
        index: SEARCH_INDEX_NAME,
        id: `${entityType}_${entityId}`,
        body: {
          entityType,
          entityId,
          indexedText,
          createdAt: now,
          updatedAt: now,
        },
      });

      // Upsert to database
      await this.searchIndexRepository.upsert(
        {
          entityType,
          entityId,
          indexedText,
        },
        ["entityType", "entityId"]
      );

      this.logger.debug(`Indexed ${entityType}:${entityId}`);
    } catch (error) {
      this.logger.error(`Failed to index ${entityType}:${entityId}`, error);
    }
  }

  /**
   * Remove an entity from ElasticSearch and database
   */
  async removeEntity(
    entityType: SearchEntityType,
    entityId: string
  ): Promise<void> {
    try {
      // Remove from ElasticSearch
      await this.elasticsearchService.delete({
        index: SEARCH_INDEX_NAME,
        id: `${entityType}_${entityId}`,
      });

      // Remove from database
      await this.searchIndexRepository.delete({ entityType, entityId });

      this.logger.debug(`Removed ${entityType}:${entityId} from index`);
    } catch (error) {
      this.logger.error(`Failed to remove ${entityType}:${entityId}`, error);
    }
  }

  /**
   * Search across entities
   */
  async search(
    query: string,
    types?: SearchEntityType[],
    limit = 10,
    offset = 0
  ): Promise<SearchResponse> {
    try {
      const must: any[] = [
        {
          multi_match: {
            query,
            fields: ["indexedText", "indexedText.autocomplete"],
            fuzziness: "AUTO",
          },
        },
      ];

      if (types && types.length > 0) {
        must.push({
          terms: { entityType: types },
        });
      }

      const result = await this.elasticsearchService.search({
        index: SEARCH_INDEX_NAME,
        body: {
          query: { bool: { must } },
          from: offset,
          size: limit,
        },
      });

      const hits = result.hits.hits as any[];
      const total =
        typeof result.hits.total === "number"
          ? result.hits.total
          : result.hits.total?.value || 0;

      return {
        data: hits.map((hit) => ({
          entityType: hit._source.entityType,
          entityId: hit._source.entityId,
          text: hit._source.indexedText,
          score: hit._score,
        })),
        total,
      };
    } catch (error) {
      this.logger.error("Search failed", error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Autocomplete suggestions
   */
  async autocomplete(
    query: string,
    types?: SearchEntityType[],
    limit = 5
  ): Promise<SearchResult[]> {
    const result = await this.search(query, types, limit, 0);
    return result.data;
  }

  /**
   * Reindex all entities of a specific type
   * Pass entity data as array of { id, text } objects
   */
  async reindexEntities(
    entityType: SearchEntityType,
    entities: Array<{ id: string; text: string }>
  ): Promise<{ indexed: number; failed: number }> {
    let indexed = 0;
    let failed = 0;

    for (const entity of entities) {
      try {
        await this.indexEntity(entityType, entity.id, entity.text);
        indexed++;
      } catch (error) {
        this.logger.error(`Failed to index ${entityType}:${entity.id}`, error);
        failed++;
      }
    }

    this.logger.log(`Reindexed ${indexed} ${entityType}s (${failed} failed)`);
    return { indexed, failed };
  }

  /**
   * Clear all entries of a specific entity type from the index
   */
  async clearEntityType(entityType: SearchEntityType): Promise<void> {
    try {
      await this.elasticsearchService.deleteByQuery({
        index: SEARCH_INDEX_NAME,
        body: {
          query: {
            term: { entityType },
          },
        },
      });

      await this.searchIndexRepository.delete({ entityType });

      this.logger.log(`Cleared all ${entityType} entries from index`);
    } catch (error) {
      this.logger.error(`Failed to clear ${entityType} entries`, error);
    }
  }

  /**
   * Get index stats
   */
  async getIndexStats(): Promise<{
    total: number;
    byType: Record<string, number>;
  }> {
    try {
      const counts = await this.searchIndexRepository
        .createQueryBuilder("si")
        .select("si.entityType", "entityType")
        .addSelect("COUNT(*)", "count")
        .groupBy("si.entityType")
        .getRawMany();

      const byType: Record<string, number> = {};
      let total = 0;
      for (const row of counts) {
        byType[row.entityType] = parseInt(row.count, 10);
        total += parseInt(row.count, 10);
      }

      return { total, byType };
    } catch (error) {
      this.logger.error("Failed to get index stats", error);
      return { total: 0, byType: {} };
    }
  }
}
