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
import { StateService } from "./state.service";
import { CreateStateDto } from "./dto/create-state.dto";
import { UpdateStateDto } from "./dto/update-state.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";
@ApiTags("states")
@Controller("states")
// @UseGuards(JwtAuthGuard)
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Get()
  @ApiOperation({ summary: "Get all states" })
  @ApiQuery({ name: "name", required: false, description: "Name of the state" })
  @ApiResponse({ status: 200, description: "List of states." })
  findAll(@Query("name") name?: string) {
    return this.stateService.findAll(name);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a state by ID" })
  @ApiResponse({ status: 200, description: "State details." })
  @ApiResponse({ status: 404, description: "State not found." })
  findOne(@Param("id") id: number) {
    return this.stateService.findOne(id);
  }

  // @Post()
  // @ApiOperation({ summary: 'Create a new state' })
  // @ApiResponse({ status: 201, description: 'State created successfully.' })
  // @ApiResponse({ status: 400, description: 'Invalid input.' })
  // create(@Body(ValidationPipe) createStateDto: CreateStateDto) {
  //   return this.stateService.create(createStateDto);
  // }

  @Post()
  @ApiOperation({ summary: "Create new states" })
  @ApiResponse({ status: 201, description: "State(s) created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(
    @Body(ValidationPipe) createStateDto: CreateStateDto | CreateStateDto[]
  ) {
    return this.stateService.create(createStateDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a state" })
  @ApiResponse({ status: 200, description: "State updated successfully." })
  @ApiResponse({ status: 404, description: "State not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateStateDto: UpdateStateDto
  ) {
    return this.stateService.update(id, updateStateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a state" })
  @ApiResponse({ status: 200, description: "State deleted successfully." })
  @ApiResponse({ status: 404, description: "State not found." })
  delete(@Param("id") id: number) {
    return this.stateService.delete(id);
  }
}
