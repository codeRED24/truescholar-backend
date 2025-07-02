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
import { Exam } from "../../exams_module/exams/exams.entity";
import { GenderType } from "../../common/enums";
import { CollegeWiseCourse } from "../college-wise-course/college_wise_course.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
@Entity()
@Index("IDX_COLLEGE_ID_CATEGORY", [
  "college_id",
  "college_cutoff_id",
  "exam_id",
])
export class CollegeCutoff {
  @PrimaryGeneratedColumn()
  college_cutoff_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "int", nullable: true })
  college_wise_course_id: number;

  @Column({ nullable: false })
  college_id?: number;

  @Column({ type: "int", nullable: false })
  exam_id?: number;

  @Column({ type: "smallint", nullable: true })
  year?: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  category?: string;

  @Column({ type: "varchar", nullable: true })
  course_full_name?: string;

  @Column({ type: "int", nullable: true })
  cutoff_score?: number;

  @Column({ type: "int", nullable: true })
  opening_rank?: number;

  @Column({ type: "int", nullable: true })
  closing_rank?: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  region?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  round?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  cutoff_score_decimal?: number;

  @Column({type: "varchar", length: 100, nullable: true})
  silos: string;
  
  @Column({
    type: "varchar",
    nullable: true,
  })
  Quota?: string;

  @Column({
    type: "enum",
    enum: GenderType,
    nullable: true,
  })
  gender?: GenderType;

  @Column({ type: "varchar", nullable: true })
  cutoff_type?: string;

  @Column({ type: "int", nullable: true })
  course_group_id: number;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.collegeCutoffs, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "college_id" })
  college: CollegeInfo;

  // Many-to-One relationship with Exams
  @ManyToOne(() => Exam, (exam) => exam.collegecutoffs, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "exam_id" })
  exam: Exam;

  @ManyToOne(() => CollegeWiseCourse, (course) => course.collegeCutoffs, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "college_wise_course_id" })
  collegeWiseCourse: CollegeWiseCourse;

  @ManyToOne(() => CourseGroup, (courseGroup) => courseGroup.collegeCutoffs, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "course_group_id" })
  courseGroup: CourseGroup;
}
