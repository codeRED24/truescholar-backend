import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../authentication_module/better-auth/entities/users.entity";

export enum NotificationType {
  // Social
  POST_LIKED = "post_liked",
  POST_COMMENTED = "post_commented",
  COMMENT_LIKED = "comment_liked",
  COMMENT_REPLIED = "comment_replied",
  CONNECTION_REQUESTED = "connection_requested",
  CONNECTION_ACCEPTED = "connection_accepted",
  NEW_FOLLOWER = "new_follower",

  // Jobs
  JOB_APPLICATION_RECEIVED = "job_application_received",
  APPLICATION_STATUS_CHANGED = "application_status_changed",

  // System
  SYSTEM_ANNOUNCEMENT = "system_announcement",
}

@Entity({ name: "notification" })
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "text" })
  recipientId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "recipientId" })
  recipient: User;

  @Column({ type: "text", nullable: true })
  actorId: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "actorId" })
  actor: User | null;

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "jsonb", default: {} })
  data: Record<string, any>;

  @Column({ type: "text", nullable: true })
  link: string | null;

  @Index()
  @Column({ type: "boolean", default: false })
  isRead: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
