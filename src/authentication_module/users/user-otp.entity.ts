import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("otp_request")
export class OtpRequest {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email_otp?: string;

  @Column({ nullable: true })
  phone_otp?: string;

  @Column({ type: "timestamp", nullable: true })
  expires_at?: Date;

  @Column({ default: false })
  phone_verified: boolean;

  @Column({ default: false })
  email_verified: boolean;

  @CreateDateColumn()
  created_at: Date;
}
