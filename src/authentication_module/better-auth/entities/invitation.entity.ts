import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./users.entity";
import { CollegeInfo } from "../../../college/college-info/college-info.entity";

@Entity({ name: "invitation" })
export class Invitation {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Index()
  @Column({ type: "int" })
  collegeId: number;

  @ManyToOne(() => CollegeInfo, { onDelete: "CASCADE" })
  @JoinColumn({ name: "collegeId", referencedColumnName: "college_id" })
  college: CollegeInfo;

  @Index()
  @Column({ type: "text" })
  email: string;

  @Column({ type: "text", nullable: true })
  phoneNumber: string | null;

  @Column({ type: "text", nullable: true })
  role: string | null;

  @Column({ type: "text" })
  status: string; // 'pending' | 'accepted' | 'rejected' | 'expired'

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "text" })
  inviterId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "inviterId" })
  inviter: User;

  @Column({ type: "text", nullable: true, unique: true })
  inviteToken: string | null;

  @Column({ type: "text", nullable: true })
  source: string | null; // 'bulk_import' | 'manual'
}
