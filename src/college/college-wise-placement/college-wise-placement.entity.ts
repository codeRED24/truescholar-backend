import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";

import { CollegeInfo } from "../college-info/college-info.entity";
@Entity()
@Index("IDX_COLLEGE_COLLEGEWISEPLACEMENT", [
  "college_id",
  "collegewise_placement_id",
])
export class CollegeWisePlacement {
  @PrimaryGeneratedColumn("increment")
  collegewise_placement_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "int", nullable: true })
  college_id?: number;

  @Column({ nullable: true })
  year?: number;

  @Column({ type: "int", nullable: true })
  highest_package?: number;

  @Column({ type: "int", nullable: true })
  avg_package?: number;

  @Column({ type: "int", nullable: true })
  median_package?: number;

  @Column({ nullable: true })
  top_recruiters?: string;

  @Column({ type: "varchar", nullable: true })
  particulars?: string;

  @Column({ type: "varchar", nullable: true })
  category?: string;

  @Column({ type: "varchar", nullable: true })
  title?: string;

  @Column({ type: "int", nullable: true })
  title_value?: number;

  @Column({ type: "int", nullable: true })
  placement_percentage?: number;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url?: string;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.collegeContents, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "college_id" })
  college: CollegeInfo;
}
