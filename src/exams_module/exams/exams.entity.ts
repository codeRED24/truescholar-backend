import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { CollegeContent } from "../../college/college-content/college-content.entity";
import { ExamContent } from "../exam-content/exam_content.entity";
import { ExamDate } from "../exam-dates/exam_dates.entity";
import { CollegeCutoff } from "../../college/college-cutoff/college_cutoff.entity";
import { CollegeExam } from "../../college/college_exam/college_exam.entity";
import { ExamFAQ } from "../exam-faq/exam-faq.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { ExamDocument } from "../../helper_entities/exams-document/exams-document.entity";
import {
  ExamCategory,
  ExamLevel,
  ExamRecognize,
  ExamSubCategory,
} from "../../common/exam.enums";

@Entity()
@Unique(["slug"])
export class Exam {
  @PrimaryGeneratedColumn("increment")
  exam_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ nullable: true, default: true })
  is_active: string;

  @Column()
  exam_name: string;

  @Column({ nullable: true })
  last_edited_by?: string;

  @Column({ nullable: true })
  exam_duration?: number;

  @Column({ nullable: true })
  exam_subject?: string;

  @Column({ nullable: true, type: "text" })
  exam_description?: string;

  @Column({ nullable: true })
  mode_of_exam?: string;

  @Column({ nullable: true })
  level_of_exam?: string;

  @Column({ type: "decimal", nullable: true })
  kapp_score?: number;

  @Column({ nullable: true })
  slug?: string;

  @Column({ nullable: true, type: "text" })
  meta_desc?: string;

  @Column({ nullable: true, type: "text" })
  exam_info?: string;

  @Column({ nullable: true, type: "text" })
  Application_process?: string;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  exam_fee_min?: string;

  @Column({ nullable: true, type: "decimal", precision: 10, scale: 2 })
  exam_fee_max?: string;

  @Column({ nullable: true })
  exam_shortname?: string;

  @Column({ nullable: true })
  application_link?: string;

  @Column({ nullable: true })
  official_website?: string;

  @Column({ nullable: true })
  official_email?: string;

  @Column({ nullable: true })
  official_mobile?: string;

  @Column({ nullable: true })
  no_of_application?: number;

  @Column({ nullable: true, type: "date" })
  last_update?: Date;

  @Column({ nullable: true })
  eligibilty_criteria?: string;

  @Column({ nullable: true, type: "text" })
  eligibilty_description?: string;

  @Column({ nullable: true })
  exam_method?: string;

  @Column({ nullable: true })
  conducting_authority?: string;

  @Column({ nullable: true })
  application_mode?: string;

  @Column({ nullable: true, default: true })
  IsPublished?: boolean;

  @Column({ nullable: true })
  key_article?: number;

  @Column({ nullable: true })
  exam_logo?: string;

  @Column({ type: "date", nullable: true })
  application_start_date?: string;

  @Column({ type: "date", nullable: true })
  application_end_date?: string;

  @Column({ type: "date", nullable: true })
  exam_date?: string;

  @Column({ type: "date", nullable: true })
  result_date?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url?: string;

  @Column({ type: "int", nullable: true })
  stream_id?: number;

  // @Column({ type: "enum", enum: ExamCategory, nullable: true })
  // exam_category: ExamCategory;

  // @Column({ type: "enum", enum: ExamSubCategory, nullable: true })
  // exam_sub_category?: ExamSubCategory;

  // @Column({ nullable: true })
  // parent_exam_id?: number;

  // @Column({ type: "enum", enum: ExamRecognize, nullable: true })
  // exam_recognize: ExamRecognize;

  // @Column({ type: "varchar", nullable: true })
  // exam_recognize_state?: string;

  // @Column({ type: "json", nullable: true })
  // category_wise_fees?: Record<string, number>;

  // @Column({ type: "json", nullable: true })
  // course_slug?: Record<string, string>;

  // @Column({ nullable: true })
  // parent_cutoff_category?: string;

  // @Column({ nullable: true })
  // year?: number;

  // @Column({ nullable: true })
  // frequency?: string;

  // @Column({ type: "enum", enum: ExamLevel, nullable: true })
  // exam_level?: ExamLevel;

  @ManyToOne(() => Stream, (stream) => stream.exam, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "stream_id" })
  stream: Stream;

  @OneToMany(() => CollegeContent, (collegeContent) => collegeContent.exam)
  collegeContents: CollegeContent[];

  @OneToMany(() => ExamContent, (examContent) => examContent.exam)
  examContents: ExamContent[];

  @OneToMany(() => ExamDate, (examDate) => examDate.exam)
  examDates: ExamContent[];

  @OneToMany(() => CollegeCutoff, (collegecutoff) => collegecutoff.exam)
  collegecutoffs: ExamContent[];

  @OneToMany(() => CollegeExam, (collegeExam) => collegeExam.exam)
  collegeExams: CollegeExam[];

  @OneToMany(() => ExamFAQ, (examFAQ) => examFAQ.exam)
  examFAQs: ExamFAQ[];

  @OneToMany(() => ExamDocument, (examDocument) => examDocument.exam)
  exam_documents: ExamDocument[];
}
