import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Exclude } from "class-transformer";

import { Session } from "../sessions/sessions.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ unique: true, nullable: true })
  custom_code: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true, unique: true })
  contact_number?: string;

  @Column({ nullable: true })
  country_of_origin?: string;

  @Column({ nullable: true })
  college_roll_number?: string;

  @Column({ nullable: true })
  user_location?: string;

  @Column({ nullable: true, type: "date" })
  dob?: string;

  @Column({ nullable: true, length: 50 })
  user_type?: string;

  @Column({ nullable: true })
  user_img_url?: string;

  @Exclude()
  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  referrer_id?: number;

  @Column({ nullable: true })
  referred_by?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "referrer_id" })
  referrer?: User;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @Column({ nullable: true })
  college?: string;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ default: false })
  is_phone_verified: boolean;

  @Column({ type: "timestamp", nullable: true })
  email_verified_at?: Date;

  @Column({ type: "timestamp", nullable: true })
  phone_verified_at?: Date;
}
