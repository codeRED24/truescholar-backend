import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique
} from "typeorm";
import { Exam } from "../exams/exams.entity";
import { ExamDateEvents } from "../../common/exam.enums";

@Entity()
@Unique(["exam_id","event_type", "year"])
export class ExamDate {
  @PrimaryGeneratedColumn()
  exam_date_id: number;

  @Column({ type: "int" })
  exam_id: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  title: string;

  @Column({ type: "date", nullable: true })
  start_date?: Date;

  @Column({ type: "date", nullable: true })
  end_date?: Date;

  @Column({ type: "enum", enum: ExamDateEvents, nullable: true })
  event_type?: ExamDateEvents;

  @Column({ nullable: true })
  is_tentative?: boolean;

  @Column({ type: "int" })
  year: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  // Many-to-One relationship with Exam
  @ManyToOne(() => Exam, (exam) => exam.examDates, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "exam_id" })
  exam: Exam;
}
