import { Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { SearchService, SearchResult } from "./search.service";
import { ReindexService } from "./reindex.service";
import { SearchEntityType } from "@/common/enums";

class SearchQueryDto {
  q: string;
  types?: string;
  limit?: number;
  offset?: number;
}

@ApiTags("Search")
@Controller("search")
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly reindexService: ReindexService
  ) {}

  @Get()
  @ApiOperation({ summary: "Search across entities" })
  @ApiQuery({ name: "q", required: true, description: "Search query" })
  @ApiQuery({
    name: "types",
    required: false,
    description: "Comma-separated entity types: user,college,event,post",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Max results (default: 10)",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Offset for pagination (default: 0)",
  })
  @ApiResponse({ status: 200, description: "Search results" })
  async search(
    @Query("q") q: string,
    @Query("types") types?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const entityTypes = types
      ? (types.split(",") as SearchEntityType[])
      : undefined;

    return this.searchService.search(
      q,
      entityTypes,
      limit ? parseInt(limit, 10) : 10,
      offset ? parseInt(offset, 10) : 0
    );
  }

  @Get("autocomplete")
  @ApiOperation({ summary: "Autocomplete suggestions" })
  @ApiQuery({ name: "q", required: true, description: "Search query" })
  @ApiQuery({
    name: "types",
    required: false,
    description: "Comma-separated entity types",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Max suggestions (default: 5)",
  })
  @ApiResponse({ status: 200, description: "Autocomplete suggestions" })
  async autocomplete(
    @Query("q") q: string,
    @Query("types") types?: string,
    @Query("limit") limit?: string
  ): Promise<SearchResult[]> {
    const entityTypes = types
      ? (types.split(",") as SearchEntityType[])
      : undefined;

    return this.searchService.autocomplete(
      q,
      entityTypes,
      limit ? parseInt(limit, 10) : 5
    );
  }

  @Get("stats")
  @ApiOperation({ summary: "Get search index statistics" })
  @ApiResponse({ status: 200, description: "Index statistics" })
  async getStats() {
    return this.searchService.getIndexStats();
  }

  @Post("reindex")
  @ApiOperation({ summary: "Reindex all entities (admin only)" })
  @ApiResponse({ status: 200, description: "Reindex results" })
  async reindexAll() {
    return this.reindexService.reindexAll();
  }

  @Post("reindex/posts")
  @ApiOperation({ summary: "Reindex all posts" })
  @ApiResponse({ status: 200, description: "Reindex results" })
  async reindexPosts() {
    return this.reindexService.reindexPosts();
  }

  @Post("reindex/events")
  @ApiOperation({ summary: "Reindex all events" })
  @ApiResponse({ status: 200, description: "Reindex results" })
  async reindexEvents() {
    return this.reindexService.reindexEvents();
  }

  @Post("reindex/users")
  @ApiOperation({ summary: "Reindex all users" })
  @ApiResponse({ status: 200, description: "Reindex results" })
  async reindexUsers() {
    return this.reindexService.reindexUsers();
  }

  @Post("reindex/colleges")
  @ApiOperation({ summary: "Reindex all colleges" })
  @ApiResponse({ status: 200, description: "Reindex results" })
  async reindexColleges() {
    return this.reindexService.reindexColleges();
  }
}
