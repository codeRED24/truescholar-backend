import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./users.entity";

@Entity({ name: "session" })
export class Session {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @Column({ type: "text", unique: true })
  token: string;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @Column({ type: "text", nullable: true })
  ipAddress: string | null;

  @Column({ type: "text", nullable: true })
  userAgent: string | null;

  @Index("session_userId_idx")
  @Column({ type: "text" })
  userId: string;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "text", nullable: true })
  activeOrganizationId: string | null;

  @Column({ type: "text", nullable: true })
  impersonatedBy: string | null;
}
