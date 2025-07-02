import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
  UseGuards,
} from "@nestjs/common";
import { RankingAgencyService } from "./ranking-agency.service";
import { CreateRankingAgencyDto } from "./dto/create-ranking_agency.dto";
import { UpdateRankingAgencyDto } from "./dto/update-ranking_agency.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("ranking_agency")
@Controller("ranking_agency")
// @UseGuards(JwtAuthGuard)
export class RankingAgencyController {
  constructor(private readonly rankingAgencyService: RankingAgencyService) {}

  @Get()
  @ApiOperation({ summary: "Get all ranking agencies" })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Name of the ranking agency",
  })
  @ApiResponse({ status: 200, description: "List of ranking agencies." })
  findAll(@Query("name") name?: string) {
    return this.rankingAgencyService.findAll(name);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a ranking agency by ID" })
  @ApiResponse({ status: 200, description: "Ranking agency details." })
  @ApiResponse({ status: 404, description: "Ranking agency not found." })
  findOne(@Param("id") id: number) {
    return this.rankingAgencyService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new ranking agency" })
  @ApiResponse({
    status: 201,
    description: "Ranking agency created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createRankingAgencyDto: CreateRankingAgencyDto) {
    return this.rankingAgencyService.create(createRankingAgencyDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a ranking agency" })
  @ApiResponse({
    status: 200,
    description: "Ranking agency updated successfully.",
  })
  @ApiResponse({ status: 404, description: "Ranking agency not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateRankingAgencyDto: UpdateRankingAgencyDto
  ) {
    return this.rankingAgencyService.update(id, updateRankingAgencyDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a ranking agency" })
  @ApiResponse({
    status: 200,
    description: "Ranking agency deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "Ranking agency not found." })
  delete(@Param("id") id: number) {
    return this.rankingAgencyService.delete(id);
  }
}
