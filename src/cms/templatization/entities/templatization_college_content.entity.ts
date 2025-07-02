import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { CollegeInfo } from "../../../college/college-info/college-info.entity";

@Entity("templatization_college_content")
@Index(["silos", "college_id"])
export class TemplatizationCollegeContent {
  @PrimaryGeneratedColumn()
  templatization_id: number;

  @Column({ type: "int" })
  college_id: number;

  @Column({ type: "varchar", length: 50 })
  silos: string;

  @Column({ type: "text" })
  description: string;

  @Column({ default: false })
  is_active: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo)
  @JoinColumn({ name: "college_id" })
  college: CollegeInfo;
}
