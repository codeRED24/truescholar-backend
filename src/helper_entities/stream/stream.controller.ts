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
import { StreamService } from "./stream.service";
import { CreateStreamDto } from "./dto/create-stream.dto";
import { UpdateStreamDto } from "./dto/update-stream.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../authentication_module/auth/jwt-auth.guard";
@ApiTags("streams")
@Controller("streams")
// @UseGuards(JwtAuthGuard)
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get()
  @ApiOperation({ summary: "Get all streams" })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Name of the stream",
  })
  @ApiResponse({ status: 200, description: "List of streams." })
  findAll(@Query("name") name?: string) {
    return this.streamService.findAll(name);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a stream by ID" })
  @ApiResponse({ status: 200, description: "Stream details." })
  @ApiResponse({ status: 404, description: "Stream not found." })
  findOne(@Param("id") id: number) {
    return this.streamService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new stream" })
  @ApiResponse({ status: 201, description: "Stream created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  create(@Body(ValidationPipe) createStreamDto: CreateStreamDto) {
    return this.streamService.create(createStreamDto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a stream" })
  @ApiResponse({ status: 200, description: "Stream updated successfully." })
  @ApiResponse({ status: 404, description: "Stream not found." })
  update(
    @Param("id") id: number,
    @Body(ValidationPipe) updateStreamDto: UpdateStreamDto
  ) {
    return this.streamService.update(id, updateStreamDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a stream" })
  @ApiResponse({ status: 200, description: "Stream deleted successfully." })
  @ApiResponse({ status: 404, description: "Stream not found." })
  delete(@Param("id") id: number) {
    return this.streamService.delete(id);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Create multiple streams in bulk" })
  @ApiResponse({ status: 201, description: "Streams created successfully." })
  @ApiResponse({ status: 400, description: "Invalid input." })
  bulkCreate(@Body(ValidationPipe) createStreamDtos: CreateStreamDto[]) {
    return this.streamService.bulkCreate(createStreamDtos);
  }
}
