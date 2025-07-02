import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Exam } from "../../exams_module/exams/exams.entity";

@Entity("exam_documents")
export class ExamDocument {
  @PrimaryGeneratedColumn()
  exam_document_id: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updated_at: string;

  @Column({ type: "varchar", nullable: false })
  exam_result_url: string;

  @Column({ type: "varchar", nullable: true })
  exam_answer_key_url: string;

  @Column({ type: "varchar", nullable: true })
  exam_paper_url: string;

  @Column({type: "varchar", nullable: true})
  doc_type: string;

  @Column({type: "int", nullable: true })
  exam_year: number;

  @ManyToOne(() => Exam, (exam) => exam.exam_documents, { onDelete: "SET NULL" })
  @JoinColumn({ name: "exam_id" })
  exam: Exam;
}
