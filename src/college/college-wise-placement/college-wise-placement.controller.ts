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
  ParseIntPipe,
} from "@nestjs/common";
import { CollegeWisePlacementService } from "./college-wise-placement.service";
import { CreateCollegeWisePlacementDto } from "./dto/create-collegewiseplacement.dto";
import { UpdateCollegeWisePlacementDto } from "./dto/update-collegewiseplacement.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("collegewiseplacement")
@Controller("collegewiseplacement")
// @UseGuards(JwtAuthGuard)
export class CollegeWisePlacementController {
  constructor(
    private readonly collegeWisePlacementService: CollegeWisePlacementService
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all college-wise placements" })
  @ApiQuery({
    name: "collegewise_placement_id",
    required: false,
    description: "Custom ID of the placement",
  })
  @ApiResponse({ status: 200, description: "List of college-wise placements." })
  findAll(
    @Query("collegewise_placement_id") collegewise_placement_id?: string
  ) {
    return this.collegeWisePlacementService.findAll(collegewise_placement_id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a college-wise placement by ID" })
  @ApiResponse({ status: 200, description: "College-wise placement details." })
  @ApiResponse({
    status: 404,
    description: "College-wise placement not found.",
  })
  findOne(@Param("id") id: number) {
    return this.collegeWisePlacementService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new college-wise placement" })
  @ApiResponse({
    status: 201,
    description: "College-wise placement created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(
    @Body(ValidationPipe)
    createCollegeWisePlacementDto: CreateCollegeWisePlacementDto
  ) {
    return this.collegeWisePlacementService.create(
      createCollegeWisePlacementDto
    );
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a college-wise placement" })
  @ApiResponse({
    status: 200,
    description: "College-wise placement updated successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "College-wise placement not found.",
  })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe)
    updateCollegeWisePlacementDto: UpdateCollegeWisePlacementDto
  ) {
    return this.collegeWisePlacementService.update(
      id,
      updateCollegeWisePlacementDto
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a college-wise placement" })
  @ApiResponse({
    status: 200,
    description: "College-wise placement deleted successfully.",
  })
  @ApiResponse({
    status: 404,
    description: "College-wise placement not found.",
  })
  delete(@Param("id") id: number) {
    return this.collegeWisePlacementService.delete(id);
  }

  @Get("by-college")
  @ApiOperation({ summary: "Get college placement details by College ID" })
  @ApiQuery({
    name: "cid",
    required: true,
    description: "College ID to fetch related placement details",
  })
  @ApiResponse({ status: 200, description: "List of college content." })
  async findByCollegeId(@Query("cid", ParseIntPipe) collegeId: number) {
    return this.collegeWisePlacementService.findByCollegeId(collegeId);
  }
}
