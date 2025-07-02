import { Exam } from "../../../exams_module/exams/exams.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  QuestionPaperType,
  ShiftType,
  SubjectType,
} from "../../../common/exam.enums";

@Entity({ name: "exam_question_papers" })
export class ExamQuestionPapers {
  @PrimaryGeneratedColumn()
  question_paper_id: number;

  @Index()
  @Column()
  exam_id: number;

  @Column({ nullable: true })
  title: string;

  @Column({
    type: "enum",
    enum: QuestionPaperType,
  })
  type: QuestionPaperType;

  @Index()
  @Column({ nullable: true })
  year: number;

  @Column({
    type: "enum",
    enum: SubjectType,
    nullable: true,
    default: null,
  })
  subject?: SubjectType | null;
  
  @Column({
    type: "enum",
    enum: ShiftType,
    nullable: true,
    default: null,
  })
  shift?: ShiftType | null;
  @Column()
  file_url: string;
  

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  // Many-to-One relationship with Exam
  @ManyToOne(() => Exam, { onDelete: "CASCADE" })
  @JoinColumn({ name: "exam_id" })
  exam: Exam;
}
