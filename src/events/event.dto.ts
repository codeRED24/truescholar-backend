import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  IsUUID,
  Min,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrganizerType, RSVPStatus } from "@/common/enums";

export class CreateEventDto {
  @ApiProperty({ enum: OrganizerType, description: "Type of organizer" })
  @IsEnum(OrganizerType)
  organizerType: OrganizerType;

  @ApiPropertyOptional({ description: "User ID (when organizerType is USER)" })
  @IsOptional()
  @IsString()
  organizerUserId?: string;

  @ApiPropertyOptional({
    description: "College ID (when organizerType is COLLEGE)",
  })
  @IsOptional()
  @IsInt()
  organizerCollegeId?: number;

  @ApiProperty({ description: "Event title", maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: "Event description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Event start time (ISO 8601 format)" })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: "Event end time (ISO 8601 format)" })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ description: "Event location", maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ description: "Media URL for the event" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  mediaUrl?: string;

  @ApiPropertyOptional({ description: "Duration of the event in minutes" })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationInMins?: number;
}

export class UpdateEventDto {
  @ApiPropertyOptional({ description: "Event title", maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: "Event description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "Event start time (ISO 8601 format)" })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: "Event end time (ISO 8601 format)" })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: "Event location", maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ description: "Media URL for the event" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  mediaUrl?: string;

  @ApiPropertyOptional({ description: "Duration of the event in minutes" })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationInMins?: number;
}

export class CreateRsvpDto {
  @ApiProperty({ description: "Event ID" })
  @IsUUID()
  eventId: string;

  @ApiProperty({ enum: RSVPStatus, description: "RSVP status" })
  @IsEnum(RSVPStatus)
  status: RSVPStatus;
}

export class UpdateRsvpDto {
  @ApiProperty({ enum: RSVPStatus, description: "RSVP status" })
  @IsEnum(RSVPStatus)
  status: RSVPStatus;
}

export class EventQueryDto {
  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: "Items per page", default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    enum: OrganizerType,
    description: "Filter by organizer type",
  })
  @IsOptional()
  @IsEnum(OrganizerType)
  organizerType?: OrganizerType;

  @ApiPropertyOptional({ description: "Filter by user organizer ID" })
  @IsOptional()
  @IsString()
  organizerUserId?: string;

  @ApiPropertyOptional({ description: "Filter by college organizer ID" })
  @IsOptional()
  @IsInt()
  organizerCollegeId?: number;

  @ApiPropertyOptional({
    description: "Filter events starting after this date",
  })
  @IsOptional()
  @IsDateString()
  startAfter?: string;

  @ApiPropertyOptional({
    description: "Filter events starting before this date",
  })
  @IsOptional()
  @IsDateString()
  startBefore?: string;
}
