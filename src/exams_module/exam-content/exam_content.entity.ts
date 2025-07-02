import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Exam } from "../exams/exams.entity";
import { Author } from "../../articles_modules/author/author.entity";
import { StatusType } from "../../common/enums";
@Entity()
export class ExamContent {
  @PrimaryGeneratedColumn()
  exam_content_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ nullable: true })
  exam_info?: string;

  @Column({ nullable: true })
  exam_eligibility?: string;

  @Column({ nullable: true })
  exam_result?: string;

  @Column({ nullable: true })
  exam_imp_highlight?: string;

  @Column({ nullable: true })
  application_process?: string;

  @Column({ nullable: true })
  year?: number;

  @Column({ nullable: true })
  syllabus?: string;

  @Column({ nullable: true })
  exam_pattern?: string;

  @Column({ nullable: true })
  cutoff?: string;

  @Column({ nullable: true })
  fees_structure?: string;

  @Column({ nullable: true })
  application_mode?: string;

  @Column({ nullable: true })
  eligibility_criteria?: string;

  @Column({ nullable: true })
  result?: string;

  @Column({ nullable: true })
  admit_card?: string;

  @Column({ nullable: true })
  author_id?: number;

  @Column({ default: false })
  is_active: boolean;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url_new?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  topic_title?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  approved_by?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  silos?: string;

  @Column({ type: "varchar", nullable: true })
  meta_desc: string;

  @Column({ type: "varchar", nullable: true })
  img1_url: string;

  @Column({ type: "varchar", nullable: true })
  img2_url: string;

  @Column({ type: "int", nullable: false })
  exam_id?: number;

  @Column({ type: "int", nullable: true })
  stage_id?: number;

  @Column({ type: "enum", enum: StatusType, default: StatusType.PENDING })
  status: StatusType;

  @Column({ nullable: true })
  assigned_to: string;

  @Column({ nullable: true, type: "varchar" })
  seo_param: string;

  @Column({ nullable: true, type: "varchar" })
  og_title?: string;

  @Column({ nullable: true, type: "varchar" })
  og_description?: string;

  @Column({ nullable: true, type: "varchar" })
  og_featured_img?: string;

  // Many-to-One relationship with Exam
  @ManyToOne(() => Exam, (exam) => exam.examContents, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "exam_id" })
  exam: Exam;

  // Many-to-One relationship with Authod
  @ManyToOne(() => Author, (author) => author.examContents, {
    nullable: true,
    onDelete: "SET NULL",
    eager: true,
  })
  @JoinColumn({ name: "author_id" })
  author: Author;
}
