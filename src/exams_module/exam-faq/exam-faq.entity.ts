import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exam } from '../exams/exams.entity';
@Entity()
export class ExamFAQ {
  @PrimaryGeneratedColumn('increment')
  exam_faq_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'int' })
  exam_id: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'smallint' })
  exam_year: number;

  @Column({ type: 'varchar', length: 500 })
  question: string;

  @Column({ type: 'varchar', length: 1000 })
  answer: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
  @ManyToOne(() => Exam, (exam) => exam.examFAQs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;
}
