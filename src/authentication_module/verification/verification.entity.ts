import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../users/users.entity";

export enum VerificationType {
  EMAIL = "email",
  PHONE = "phone",
}

export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  EXPIRED = "expired",
  FAILED = "failed",
}

@Entity()
export class Verification {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "enum", enum: VerificationType })
  type: VerificationType;

  @Column()
  identifier: string; // email address or phone number

  @Column()
  otp: string;

  @Column({
    type: "enum",
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ type: "timestamp" })
  expires_at: Date;

  @Column({ type: "timestamp", nullable: true })
  verified_at?: Date;

  @Column({ default: 0 })
  attempts: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  user_id: number;
}
