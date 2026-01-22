import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Like } from "typeorm";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { EntityHandle, EntityType } from "./entity-handle.entity";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import {
  HANDLES_INDEX_NAME,
  HANDLES_INDEX_MAPPING,
} from "./handles-es.constants";

@Injectable()
export class HandlesService implements OnModuleInit {
  private readonly logger = new Logger(HandlesService.name);

  constructor(
    @InjectRepository(EntityHandle)
    private readonly handleRepo: Repository<EntityHandle>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CollegeInfo)
    private readonly collegeRepo: Repository<CollegeInfo>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async onModuleInit() {
    await this.createIndexIfNotExists();
  }

  private async createIndexIfNotExists() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: HANDLES_INDEX_NAME,
      });

      if (!indexExists) {
        this.logger.log(`Creating Elasticsearch index: ${HANDLES_INDEX_NAME}`);
        await this.elasticsearchService.indices.create({
          index: HANDLES_INDEX_NAME,
          body: HANDLES_INDEX_MAPPING as any,
        });
      }
    } catch (error) {
      this.logger.error("Failed to initialize ES index", error);
    }
  }

  async findByHandle(handle: string): Promise<EntityHandle | null> {
    return this.handleRepo.findOne({ where: { handle: handle.toLowerCase() } });
  }

  async findByHandles(handles: string[]): Promise<EntityHandle[]> {
    if (!handles.length) return [];
    return this.handleRepo.find({
      where: { handle: In(handles.map((h) => h.toLowerCase())) },
    });
  }

  async search(query: string, limit = 10): Promise<EntityHandle[]> {
    if (!query) return [];
    try {
      const result = await this.elasticsearchService.search({
        index: HANDLES_INDEX_NAME,
        body: {
          query: {
            multi_match: {
              query: query.toLowerCase(),
              fields: ["handle^2", "displayName"],
              type: "bool_prefix",
            },
          },
          size: limit,
        },
      });

      // Map ES results to EntityHandle structure
      // @ts-ignore: ElasticSearch types can be tricky
      return result.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
      }));
    } catch (error) {
      this.logger.error(`ES Search failed: ${error.message}`);
      // Fallback to DB
      return this.handleRepo.find({
        where: [
          { handle: Like(`%${query.toLowerCase()}%`) },
          { displayName: Like(`%${query}%`) },
        ],
        take: limit,
      });
    }
  }

  async createHandle(
    handle: string,
    entityType: EntityType,
    entityId: string,
    displayName: string,
    image?: string,
  ): Promise<EntityHandle> {
    // Basic slugify if needed, but assuming handle is passed clean
    let cleanHandle = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");

    // Check collision and auto-increment if needed (simple retry logic)
    let retries = 0;
    let finalHandle = cleanHandle;
    while (retries < 5) {
      const existing = await this.findByHandle(finalHandle);
      if (!existing) break;
      finalHandle = `${cleanHandle}${Math.floor(Math.random() * 1000)}`;
      retries++;
    }

    if (retries >= 5)
      throw new Error(`Could not generate unique handle for ${handle}`);

    const newHandle = this.handleRepo.create({
      handle: finalHandle,
      entityType,
      entityId,
      displayName,
      image,
    });
    const saved = await this.handleRepo.save(newHandle);

    // Index to ES
    await this.indexHandleToES(saved);

    return saved;
  }

  private async indexHandleToES(handle: EntityHandle): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: HANDLES_INDEX_NAME,
        id: handle.id,
        body: {
          handle: handle.handle,
          displayName: handle.displayName,
          entityType: handle.entityType,
          entityId: handle.entityId,
          image: handle.image,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index handle ${handle.handle}`, error);
    }
  }

  async removeHandleFromES(handleId: string): Promise<void> {
    try {
      await this.elasticsearchService.delete({
        index: HANDLES_INDEX_NAME,
        id: handleId,
      });
    } catch (error) {
      this.logger.error(`Failed to delete handle ${handleId} from ES`, error);
    }
  }

  async reindexAllHandles() {
    this.logger.log("Starting full reindex of handles...");
    const handles = await this.handleRepo.find();

    const body = handles.flatMap((h) => [
      { index: { _index: HANDLES_INDEX_NAME, _id: h.id } },
      {
        handle: h.handle,
        displayName: h.displayName,
        entityType: h.entityType,
        entityId: h.entityId,
        image: h.image,
      },
    ]);

    if (body.length > 0) {
      const response = await this.elasticsearchService.bulk({ body });
      if (response.errors) {
        // @ts-ignore
        this.logger.error(
          "Bulk reindex had errors",
          response.items.filter((item: any) => item.index && item.index.error),
        );
      }
    }

    this.logger.log(`Reindexed ${handles.length} handles`);
    return { count: handles.length };
  }

  // Backfill Logic
  async syncAllHandles() {
    this.logger.log("Starting Handle Sync...");

    // 1. Sync Users
    const users = await this.userRepo.find();
    let userCount = 0;
    for (const user of users) {
      const existing = await this.handleRepo.findOne({
        where: { entityId: user.id, entityType: EntityType.USER },
      });
      if (!existing) {
        await this.createHandle(
          user.name.replace(/\s+/g, "_"), // Simple slugify
          EntityType.USER,
          user.id,
          user.name,
          user.image || undefined,
        );
        userCount++;
      }
    }
    this.logger.log(`Synced ${userCount} new user handles`);

    // 2. Sync Colleges
    const colleges = await this.collegeRepo.find();
    let collegeCount = 0;
    for (const college of colleges) {
      const existing = await this.handleRepo.findOne({
        where: {
          entityId: college.college_id.toString(),
          entityType: EntityType.COLLEGE,
        },
      });
      if (!existing) {
        const handleBase =
          college.slug ||
          college.short_name ||
          college.college_name.replace(/\s+/g, "_");
        await this.createHandle(
          handleBase,
          EntityType.COLLEGE,
          college.college_id.toString(),
          college.college_name,
          college.logo_img || undefined,
        );
        collegeCount++;
        this.logger.log(`Created handle for college: ${collegeCount}`);
      }
    }
    this.logger.log(`Synced ${collegeCount} new college handles`);

    // Trigger reindex to ensure all are in ES
    await this.reindexAllHandles();

    return { userCount, collegeCount };
  }
}
