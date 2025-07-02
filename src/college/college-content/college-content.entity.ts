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
import { CollegeInfo } from "../college-info/college-info.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
import { Author } from "../../articles_modules/author/author.entity";

@Entity()
@Index(["silos", "college_id"])
export class CollegeContent {
  @PrimaryGeneratedColumn()
  college_content_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "varchar", length: 300 })
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "int", nullable: true })
  exam_id?: number;

  @Column({ type: "int", nullable: true })
  course_group_id?: number;

  @Column({ type: "int", nullable: true })
  college_id?: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  silos?: string;

  @Column({ type: "int", nullable: true })
  author_id?: number;

  @Column({ default: false })
  is_active: boolean;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url_new?: string;

  @Column({ type: "varchar", nullable: true })
  meta_desc: string;

  @Column({ type: "varchar", nullable: true })
  approved_by: string;

  @Column({ type: "varchar", nullable: true })
  img1_url: string;

  @Column({ type: "varchar", nullable: true })
  img2_url: string;

  @Column({ nullable: true })
  assigned_to: string;

  @Column({ type: "text", nullable: true })
  seo_param?: string;

  @Column({ type: "int", nullable: true })
  stage_id?: number;

  @Column({ type: "varchar", nullable: true })
  status: string;

  // @Column({ nullable: true, type: "varchar" })
  // og_title?: string;

  // @Column({ nullable: true, type: "varchar" })
  // og_description?: string;

  // @Column({ nullable: true, type: "varchar" })
  // og_featured_img?: string;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.collegeContents, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "college_id" })
  college: CollegeInfo;

  // Many-to-One relationship with Exam
  @ManyToOne(() => Exam, (exam) => exam.collegeContents, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "exam_id" })
  exam: Exam;

  @ManyToOne(() => Author, (author) => author.collegeContents, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "author_id" })
  author: Author;
}
