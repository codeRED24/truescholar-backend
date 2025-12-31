import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Session } from "./session.entity";
import { Account } from "./account.entity";
import { CollegeInfo } from "../../../college/college-info/college-info.entity";
import { Member } from "./member.entity";
import { Invitation } from "./invitation.entity";

@Entity({ name: "user" })
export class User {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "boolean" })
  emailVerified: boolean;

  @Column({ type: "text", nullable: true })
  image: string | null;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @Column({ type: "text", nullable: true, unique: true })
  phoneNumber: string | null;

  @Column({ type: "boolean", nullable: true })
  phoneNumberVerified: boolean | null;

  @Column({ type: "text", nullable: true })
  role: string | null;

  @Column({ type: "boolean", nullable: true })
  banned: boolean | null;

  @Column({ type: "text", nullable: true })
  banReason: string | null;

  @Column({ type: "timestamptz", nullable: true })
  banExpires: Date | null;

  // ===== New Profile Fields =====

  // College association
  @Index()
  @Column({ nullable: true, type: "int" })
  college_id: number | null;

  @ManyToOne(() => CollegeInfo, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "college_id" })
  college: CollegeInfo | null;

  // User type
  @Column({ type: "text", nullable: true })
  user_type: "student" | "alumni" | "faculty" | null;

  // Demographics
  @Column({ type: "text", nullable: true })
  gender: string | null;

  @Column({ type: "date", nullable: true })
  dob: Date | null;

  @Column({ type: "text", nullable: true })
  country_origin: string | null;

  // College-specific info
  @Column({ type: "text", nullable: true })
  college_roll_number: string | null;

  // Referral system
  @Index()
  @Column({ type: "text", nullable: true, unique: true })
  custom_code: string | null;

  @Column({ type: "text", nullable: true })
  referred_by: string | null;

  // ===== Relations =====

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => Member, (member) => member.user)
  members: Member[];

  @OneToMany(() => Invitation, (invitation) => invitation.inviter)
  sentInvitations: Invitation[];
}
