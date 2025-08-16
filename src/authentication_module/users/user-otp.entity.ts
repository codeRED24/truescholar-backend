import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class OtpRequest {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  email_otp?: string;

  @Column()
  phone_otp?: string;

  @Column({ type: "timestamp" })
  expires_at?: Date;

  @Column({ default: false })
  phone_verified: boolean;

  @Column({ default: false })
  email_verified: boolean;

  @CreateDateColumn()
  created_at: Date;
}
