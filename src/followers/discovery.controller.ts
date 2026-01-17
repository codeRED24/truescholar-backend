import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";
import { DiscoveryService } from "./discovery.service";

@ApiTags("Discovery")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("followers")
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get("suggestions")
  @ApiOperation({
    summary: "Get suggested users to follow (Friends of Friends)",
  })
  async getSuggestions(
    @User() user: { id: string },
    @Query("limit") limit?: string
  ) {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 50) : 20;
    return this.discoveryService.getSuggestions(user.id, parsedLimit);
  }
}
