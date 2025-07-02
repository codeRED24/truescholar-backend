import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CollegeInfo } from "../college-info/college-info.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";

@Entity()
export class CollegeExam {
  @PrimaryGeneratedColumn()
  college_exam_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "int", nullable: false })
  college_id?: number;

  @Column({ type: "int", nullable: false })
  exam_id: number;

  @Column({ type: "int", nullable: true })
  college_course_id: number;

  @Column({ type: "varchar", length: 500, nullable: false })
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url?: string;

  @Column({ type: "int", nullable: true })
  course_group_id: number;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.collegeExams, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "college_id" })
  college: CollegeInfo;

  // Many-to-One relationship with Exam
  @ManyToOne(() => Exam, (exam) => exam.collegeExams, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "exam_id" })
  exam: Exam;

  @ManyToOne(() => CourseGroup, (courseGroup) => courseGroup.collegeExams, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "course_group_id" })
  courseGroup: CourseGroup;
}
