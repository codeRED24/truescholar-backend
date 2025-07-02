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
import { CitiesService } from "./cities.service";
import { CreateCityDto } from "./dto/create-city.dto";
import { UpdateCityDto } from "./dto/update-city.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { UseInterceptors } from "@nestjs/common";
@ApiTags("cities")
@Controller("cities")
// @UseGuards(JwtAuthGuard)
// @UseInterceptors(CacheInterceptor)
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @ApiOperation({ summary: "Get all cities" })
  @ApiQuery({ name: "name", required: false, description: "Name of the city" })
  @ApiResponse({ status: 200, description: "List of cities." })
  // @UseInterceptors(CacheInterceptor)
  findAll(@Query("name") name?: string) {
    return this.citiesService.findAll(name);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a city by ID" })
  @ApiResponse({ status: 200, description: "City details." })
  @ApiResponse({ status: 404, description: "City not found." })
  findOne(@Param("id") id: number) {
    return this.citiesService.findOne(id);
  }

  // @Post()
  // @ApiOperation({ summary: 'Create a new city' })
  // @ApiResponse({ status: 201, description: 'City created successfully.' })
  // @ApiResponse({ status: 400, description: 'Invalid input.' })
  // create(
  //   @Body(ValidationPipe)
  //   createCityDto: CreateCityDto,
  // ) {
  //   return this.citiesService.create(createCityDto);
  // }
  @Post()
  @ApiOperation({ summary: "Create new cities" })
  @ApiResponse({
    status: 201,
    description: "City/Cities created successfully.",
  })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createCityDto: CreateCityDto | CreateCityDto[]) {
    return this.citiesService.create(createCityDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a city" })
  @ApiResponse({ status: 200, description: "City updated successfully." })
  @ApiResponse({ status: 404, description: "City not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateCityDto: UpdateCityDto
  ) {
    return this.citiesService.update(id, updateCityDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a city" })
  @ApiResponse({ status: 200, description: "City deleted successfully." })
  @ApiResponse({ status: 404, description: "City not found." })
  delete(@Param("id") id: number) {
    return this.citiesService.delete(id);
  }
}
