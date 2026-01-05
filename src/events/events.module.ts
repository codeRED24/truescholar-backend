import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Event } from "./event.entity";
import { EventRsvp } from "./event-rsvp.entity";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { SharedModule } from "@/shared/shared.module";

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventRsvp]), SharedModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
