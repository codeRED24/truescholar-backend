import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import { OrganizerType } from "@/common/enums";

@Entity({ name: "events" })
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: OrganizerType,
    default: OrganizerType.USER,
  })
  organizerType: OrganizerType;

  // User organizer (when organizerType is USER)
  @Index()
  @Column({ type: "text", nullable: true })
  organizerUserId?: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "organizerUserId" })
  organizerUser?: User;

  // College organizer (when organizerType is COLLEGE)
  @Index()
  @Column({ type: "int", nullable: true })
  organizerCollegeId?: number;

  @ManyToOne(() => CollegeInfo, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "organizerCollegeId" })
  organizerCollege?: CollegeInfo;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Index()
  @Column({ type: "timestamptz" })
  startTime: Date;

  @Column({ type: "timestamptz" })
  endTime: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  location?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  mediaUrl?: string;

  @Column({ type: "int", nullable: true })
  durationInMins?: number;

  @Column({ type: "int", default: 0 })
  rsvpCount: number;

  @Column({ type: "boolean", default: false })
  isDeleted: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  // Helper getter to get the organizer ID regardless of type
  get organizerId(): string | number | undefined {
    return this.organizerType === OrganizerType.USER
      ? this.organizerUserId
      : this.organizerCollegeId;
  }
}
