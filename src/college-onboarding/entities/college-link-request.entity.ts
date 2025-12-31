import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../authentication_module/better-auth/entities/users.entity";
import { CollegeInfo } from "../../college/college-info/college-info.entity";

export enum LinkRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity({ name: "college_link_request" })
export class CollegeLinkRequest {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Index()
  @Column({ type: "text" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Index()
  @Column({ type: "int" })
  collegeId: number;

  @ManyToOne(() => CollegeInfo, { onDelete: "CASCADE" })
  @JoinColumn({ name: "collegeId", referencedColumnName: "college_id" })
  college: CollegeInfo;

  @Column({ type: "text", default: LinkRequestStatus.PENDING })
  status: LinkRequestStatus;

  @Column({ type: "text" })
  requestedRole: string; // 'student' | 'alumni'

  @Column({ type: "int", nullable: true })
  enrollmentYear: number | null;

  @Column({ type: "int", nullable: true })
  graduationYear: number | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  reviewedAt: Date | null;

  @Column({ type: "text", nullable: true })
  reviewedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "reviewedBy" })
  reviewer: User | null;
}
