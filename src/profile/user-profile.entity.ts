import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../authentication_module/better-auth/entities/users.entity";

// Experience entry interface
export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
}

// Education entry interface
export interface EducationEntry {
  id: string;
  collegeId: number | null;
  collegeName?: string | null;
  courseId: number | null;
  courseName?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  grade?: string | null;
  description?: string | null;
}

@Entity({ name: "user_profile" })
export class UserProfile {
  // Use the same ID as the user (1:1 relationship)
  @PrimaryColumn({ type: "text" })
  user_id: string;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  // Bio
  @Column({ type: "text", nullable: true })
  bio: string | null;

  // Work Experience (JSONB array)
  @Column({ type: "jsonb", nullable: true, default: [] })
  experience: ExperienceEntry[] | null;

  // Education History (JSONB array)
  @Column({ type: "jsonb", nullable: true, default: [] })
  education: EducationEntry[] | null;

  // Social Links
  @Column({ type: "text", nullable: true })
  linkedin_url: string | null;

  @Column({ type: "text", nullable: true })
  twitter_url: string | null;

  @Column({ type: "text", nullable: true })
  github_url: string | null;

  @Column({ type: "text", nullable: true })
  website_url: string | null;

  // Location
  @Column({ type: "text", nullable: true })
  city: string | null;

  @Column({ type: "text", nullable: true })
  state: string | null;

  // Skills (JSONB array of strings)
  @Column({ type: "jsonb", nullable: true, default: [] })
  skills: string[] | null;

  // Timestamps
  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;
}
