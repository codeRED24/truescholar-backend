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
import { FacilitiesService } from "./facilities.service";
import { CreateFacilitiesDto } from "./dto/create-facilities.dto";
import { UpdateFacilitiesDto } from "./dto/update-facilities.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("facilities")
@Controller("facilities")
// @UseGuards(JwtAuthGuard)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  @ApiOperation({ summary: "Get all facilities" })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Name of the facility",
  })
  @ApiResponse({ status: 200, description: "List of facilities." })
  findAll(@Query("name") name?: string) {
    return this.facilitiesService.findAll(name);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a facility by ID" })
  @ApiResponse({ status: 200, description: "Facility details." })
  @ApiResponse({ status: 404, description: "Facility not found." })
  findOne(@Param("id") id: number) {
    return this.facilitiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new facility" })
  @ApiResponse({ status: 201, description: "Facility created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createFacilitiesDto: CreateFacilitiesDto) {
    return this.facilitiesService.create(createFacilitiesDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a facility" })
  @ApiResponse({ status: 200, description: "Facility updated successfully." })
  @ApiResponse({ status: 404, description: "Facility not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateFacilitiesDto: UpdateFacilitiesDto
  ) {
    return this.facilitiesService.update(id, updateFacilitiesDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a facility" })
  @ApiResponse({ status: 200, description: "Facility deleted successfully." })
  @ApiResponse({ status: 404, description: "Facility not found." })
  delete(@Param("id") id: number) {
    return this.facilitiesService.delete(id);
  }
}
