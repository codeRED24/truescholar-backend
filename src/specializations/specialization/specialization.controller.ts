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
  BadRequestException,
} from "@nestjs/common";
import { SpecializationService } from "./specialization.service";
import { CreateSpecializationDto } from "./dto/create-specialization.dto";
import { UpdateSpecializationDto } from "./dto/update-specialization.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";

@ApiTags("specializations")
@Controller("specializations")
// @UseGuards(JwtAuthGuard)
export class SpecializationController {
  constructor(private readonly specializationService: SpecializationService) {}

  @Get()
  @ApiOperation({ summary: "Get all specializations" })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Name of the specialization",
  })
  @ApiResponse({ status: 200, description: "List of specializations." })
  findAll(@Query("name") name?: string) {
    return this.specializationService.findAll(name);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specialization by ID" })
  @ApiResponse({ status: 200, description: "Specialization details." })
  @ApiResponse({ status: 404, description: "Specialization not found." })
  findOne(@Param("id") id: number) {
    return this.specializationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new specialization" })
  @ApiResponse({
    status: 201,
    description: "Specialization created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(
    @Body(ValidationPipe) createSpecializationDto: CreateSpecializationDto
  ) {
    return this.specializationService.create(createSpecializationDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a specialization" })
  @ApiResponse({
    status: 200,
    description: "Specialization updated successfully.",
  })
  @ApiResponse({ status: 404, description: "Specialization not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateSpecializationDto: UpdateSpecializationDto
  ) {
    return this.specializationService.update(id, updateSpecializationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a specialization" })
  @ApiResponse({
    status: 200,
    description: "Specialization deleted successfully.",
  })
  @ApiResponse({ status: 404, description: "Specialization not found." })
  delete(@Param("id") id: number) {
    return this.specializationService.delete(id);
  }

  // New bulk upload endpoint
  @Post("bulk")
  @ApiOperation({ summary: "Bulk upload specializations" })
  @ApiResponse({
    status: 201,
    description: "Specializations created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  bulkCreate(
    @Body(ValidationPipe) createSpecializationDtos: CreateSpecializationDto[]
  ) {
    if (
      !Array.isArray(createSpecializationDtos) ||
      createSpecializationDtos.length === 0
    ) {
      throw new BadRequestException("No data provided for bulk upload");
    }
    return this.specializationService.bulkCreate(createSpecializationDtos);
  }

  @Get("ids-names")
  @ApiOperation({ summary: "Get paginated and filtered specialization IDs and names" })
  @ApiResponse({ status: 200, description: "List of specialization IDs and names." })
  async getAllSpecializationIdsAndNames(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 9,
    @Query('search') search?: string
  ) {
    return this.specializationService.getAllSpecializationIdsAndNames(page, limit, search);
  }
  
 
}
