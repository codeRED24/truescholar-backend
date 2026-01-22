import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { HandlesService } from "./handles.service";

@ApiTags("Handles")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("handles")
export class HandlesController {
  constructor(private readonly handlesService: HandlesService) {}

  @Get("search")
  @ApiOperation({ summary: "Search for handles (@mention autocomplete)" })
  async search(@Query("q") query: string) {
    if (!query || query.length < 1) return [];
    return this.handlesService.search(query);
  }

  @Post("sync")
  @ApiOperation({ summary: "Manually trigger handle sync (Admin only ideally)" })
  async sync() {
    return this.handlesService.syncAllHandles();
  }

  @Post("reindex")
  @ApiOperation({ summary: "Manually reindex all handles to Elasticsearch" })
  async reindex() {
    return this.handlesService.reindexAllHandles();
  }
}
