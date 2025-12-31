import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from "typeorm";
import { User } from "../authentication_module/better-auth/entities/users.entity";

export enum ConnectionStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

@Entity({ name: "connection" })
@Index(["requesterId", "addresseeId"], { unique: true })
@Check(`"requesterId" != "addresseeId"`)
export class Connection {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "text" })
  requesterId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "requesterId" })
  requester: User;

  @Index()
  @Column({ type: "text" })
  addresseeId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "addresseeId" })
  addressee: User;

  @Column({
    type: "enum",
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING,
  })
  status: ConnectionStatus;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
