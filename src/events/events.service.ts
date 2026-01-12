import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThanOrEqual, LessThanOrEqual, And } from "typeorm";
import { ClientKafka } from "@nestjs/microservices";
import { KAFKA_SERVICE } from "@/shared/kafka/kafka.module";
import { Event } from "./event.entity";
import { EventRsvp } from "./event-rsvp.entity";
import {
  CreateEventDto,
  UpdateEventDto,
  CreateRsvpDto,
  UpdateRsvpDto,
  EventQueryDto,
} from "./event.dto";
import { RSVPStatus } from "@/common/enums";
import { randomUUID } from "crypto";

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventRsvp)
    private readonly rsvpRepository: Repository<EventRsvp>,
    @Inject(KAFKA_SERVICE) private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async createEvent(dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      ...dto,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });
    const savedEvent = await this.eventRepository.save(event);

    // Emit event for search indexing
    this.kafkaClient.emit("event.created", {
      eventId: randomUUID(),
      eventType: "event.created",
      aggregateId: savedEvent.id,
      occurredAt: new Date().toISOString(),
      payload: {
        title: savedEvent.title,
        description: savedEvent.description,
        location: savedEvent.location,
      },
    });

    return savedEvent;
  }

  async getEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!event) {
      throw new NotFoundException("Event not found");
    }
    return event;
  }

  async getEvents(query: EventQueryDto) {
    const {
      page = 1,
      limit = 10,
      organizerType,
      organizerUserId,
      organizerCollegeId,
      startAfter,
      startBefore,
    } = query;

    const where: any = { isDeleted: false };

    if (organizerType) {
      where.organizerType = organizerType;
    }
    if (organizerUserId) {
      where.organizerUserId = organizerUserId;
    }
    if (organizerCollegeId) {
      where.organizerCollegeId = organizerCollegeId;
    }
    if (startAfter && startBefore) {
      where.startTime = And(
        MoreThanOrEqual(new Date(startAfter)),
        LessThanOrEqual(new Date(startBefore))
      );
    } else if (startAfter) {
      where.startTime = MoreThanOrEqual(new Date(startAfter));
    } else if (startBefore) {
      where.startTime = LessThanOrEqual(new Date(startBefore));
    }

    const [events, total] = await this.eventRepository.findAndCount({
      where,
      order: { startTime: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateEvent(
    id: string,
    dto: UpdateEventDto,
    userId: string
  ): Promise<Event> {
    const event = await this.getEventById(id);

    // Check ownership (user can only update their own events)
    if (event.organizerUserId !== userId) {
      throw new ForbiddenException("You can only update your own events");
    }

    const updateData: Partial<Event> = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.mediaUrl !== undefined) updateData.mediaUrl = dto.mediaUrl;
    if (dto.durationInMins !== undefined)
      updateData.durationInMins = dto.durationInMins;
    if (dto.startTime) updateData.startTime = new Date(dto.startTime);
    if (dto.endTime) updateData.endTime = new Date(dto.endTime);

    await this.eventRepository.update(id, updateData);
    const updatedEvent = await this.getEventById(id);

    // Emit event for search indexing
    this.kafkaClient.emit("event.updated", {
      eventId: randomUUID(),
      eventType: "event.updated",
      aggregateId: id,
      occurredAt: new Date().toISOString(),
      payload: {
        title: updatedEvent.title,
        description: updatedEvent.description,
        location: updatedEvent.location,
      },
    });

    return updatedEvent;
  }

  async deleteEvent(id: string, userId: string): Promise<void> {
    const event = await this.getEventById(id);

    if (event.organizerUserId !== userId) {
      throw new ForbiddenException("You can only delete your own events");
    }

    await this.eventRepository.update(id, { isDeleted: true });

    // Emit event for search indexing
    this.kafkaClient.emit("event.deleted", {
      eventId: randomUUID(),
      eventType: "event.deleted",
      aggregateId: id,
      occurredAt: new Date().toISOString(),
      payload: { eventId: id },
    });
  }

  // RSVP Methods
  async createOrUpdateRsvp(
    dto: CreateRsvpDto,
    userId: string
  ): Promise<EventRsvp> {
    // Verify event exists
    await this.getEventById(dto.eventId);

    // Check if RSVP already exists
    const existingRsvp = await this.rsvpRepository.findOne({
      where: { eventId: dto.eventId, userId },
    });

    if (existingRsvp) {
      existingRsvp.status = dto.status;
      return this.rsvpRepository.save(existingRsvp);
    }

    const rsvp = this.rsvpRepository.create({
      eventId: dto.eventId,
      userId,
      status: dto.status,
    });

    const savedRsvp = await this.rsvpRepository.save(rsvp);

    // Update RSVP count on event
    if (dto.status === RSVPStatus.BOOKED) {
      await this.eventRepository.increment({ id: dto.eventId }, "rsvpCount", 1);
    }

    return savedRsvp;
  }

  async updateRsvp(
    rsvpId: string,
    dto: UpdateRsvpDto,
    userId: string
  ): Promise<EventRsvp> {
    const rsvp = await this.rsvpRepository.findOne({
      where: { id: rsvpId },
    });

    if (!rsvp) {
      throw new NotFoundException("RSVP not found");
    }

    if (rsvp.userId !== userId) {
      throw new ForbiddenException("You can only update your own RSVP");
    }

    const oldStatus = rsvp.status;
    rsvp.status = dto.status;

    const savedRsvp = await this.rsvpRepository.save(rsvp);

    // Update RSVP count on event
    if (oldStatus === RSVPStatus.BOOKED && dto.status !== RSVPStatus.BOOKED) {
      await this.eventRepository.decrement(
        { id: rsvp.eventId },
        "rsvpCount",
        1
      );
    } else if (
      oldStatus !== RSVPStatus.BOOKED &&
      dto.status === RSVPStatus.BOOKED
    ) {
      await this.eventRepository.increment(
        { id: rsvp.eventId },
        "rsvpCount",
        1
      );
    }

    return savedRsvp;
  }

  async getRsvpsByEvent(eventId: string, page = 1, limit = 10) {
    const [rsvps, total] = await this.rsvpRepository.findAndCount({
      where: { eventId },
      relations: ["user"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: rsvps,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserRsvp(
    eventId: string,
    userId: string
  ): Promise<EventRsvp | null> {
    return this.rsvpRepository.findOne({
      where: { eventId, userId },
    });
  }

  async deleteRsvp(rsvpId: string, userId: string): Promise<void> {
    const rsvp = await this.rsvpRepository.findOne({
      where: { id: rsvpId },
    });

    if (!rsvp) {
      throw new NotFoundException("RSVP not found");
    }

    if (rsvp.userId !== userId) {
      throw new ForbiddenException("You can only delete your own RSVP");
    }

    if (rsvp.status === RSVPStatus.BOOKED) {
      await this.eventRepository.decrement(
        { id: rsvp.eventId },
        "rsvpCount",
        1
      );
    }

    await this.rsvpRepository.delete(rsvpId);
  }
}
