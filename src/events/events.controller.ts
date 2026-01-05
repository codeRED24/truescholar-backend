import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { EventsService } from "./events.service";
import {
  CreateEventDto,
  UpdateEventDto,
  CreateRsvpDto,
  UpdateRsvpDto,
  EventQueryDto,
} from "./event.dto";
import { AuthGuard } from "../authentication_module/better-auth/guards/auth.guard";
import { User } from "../authentication_module/better-auth/decorators/auth.decorators";

@ApiTags("Events")
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new event" })
  @ApiResponse({ status: 201, description: "Event created successfully" })
  async createEvent(@Body() dto: CreateEventDto, @User() user: { id: string }) {
    return this.eventsService.createEvent(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all events with pagination and filters" })
  @ApiResponse({ status: 200, description: "Events retrieved successfully" })
  async getEvents(@Query() query: EventQueryDto) {
    return this.eventsService.getEvents(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single event by ID" })
  @ApiResponse({ status: 200, description: "Event retrieved successfully" })
  @ApiResponse({ status: 404, description: "Event not found" })
  async getEventById(@Param("id", ParseUUIDPipe) id: string) {
    return this.eventsService.getEventById(id);
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update an event" })
  @ApiResponse({ status: 200, description: "Event updated successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Event not found" })
  async updateEvent(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @User() user: { id: string }
  ) {
    return this.eventsService.updateEvent(id, dto, user.id);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an event" })
  @ApiResponse({ status: 204, description: "Event deleted successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Event not found" })
  async deleteEvent(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: { id: string }
  ) {
    await this.eventsService.deleteEvent(id, user.id);
  }

  // RSVP Endpoints
  @Post("rsvp")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create or update RSVP for an event" })
  @ApiResponse({
    status: 201,
    description: "RSVP created/updated successfully",
  })
  async createRsvp(@Body() dto: CreateRsvpDto, @User() user: { id: string }) {
    return this.eventsService.createOrUpdateRsvp(dto, user.id);
  }

  @Put("rsvp/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update RSVP status" })
  @ApiResponse({ status: 200, description: "RSVP updated successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "RSVP not found" })
  async updateRsvp(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateRsvpDto,
    @User() user: { id: string }
  ) {
    return this.eventsService.updateRsvp(id, dto, user.id);
  }

  @Get(":eventId/rsvps")
  @ApiOperation({ summary: "Get all RSVPs for an event" })
  @ApiResponse({ status: 200, description: "RSVPs retrieved successfully" })
  async getRsvpsByEvent(
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    return this.eventsService.getRsvpsByEvent(eventId, page, limit);
  }

  @Get(":eventId/my-rsvp")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's RSVP for an event" })
  @ApiResponse({ status: 200, description: "RSVP retrieved successfully" })
  async getUserRsvp(
    @Param("eventId", ParseUUIDPipe) eventId: string,
    @User() user: { id: string }
  ) {
    return this.eventsService.getUserRsvp(eventId, user.id);
  }

  @Delete("rsvp/:id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete RSVP" })
  @ApiResponse({ status: 204, description: "RSVP deleted successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "RSVP not found" })
  async deleteRsvp(
    @Param("id", ParseUUIDPipe) id: string,
    @User() user: { id: string }
  ) {
    await this.eventsService.deleteRsvp(id, user.id);
  }
}
