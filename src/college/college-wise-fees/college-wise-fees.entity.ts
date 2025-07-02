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
import { CollegeWiseCourse } from "../college-wise-course/college_wise_course.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { Category, Type } from "../../common/enums";
@Entity()
@Index("IDX_COLLEGE_COURSE_FEES", [
  "college_id",
  "course_group_id",
  "collegewise_fees_id",
])
export class CollegeWiseFees {
  @PrimaryGeneratedColumn()
  collegewise_fees_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "boolean", nullable: true })
  is_active?: boolean;

  @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
  kapp_score?: number;

  @Column({ type: "int", nullable: true })
  total_min_fees?: number;

  @Column({ type: "int", nullable: true })
  total_max_fees?: number;

  @Column({ type: "int", nullable: true })
  tution_fees_min_amount?: number;

  @Column({ type: "int", nullable: true })
  tution_fees_max_amount?: number;

  @Column({ type: "int", nullable: true })
  min_one_time_fees?: number;

  @Column({ type: "int", nullable: true })
  max_one_time_fees?: number;

  @Column({ type: "int", nullable: true })
  max_hostel_fees?: number;

  @Column({ type: "int", nullable: true })
  min_hostel_fees?: number;

  @Column({ type: "int", nullable: true })
  min_other_fees?: number;

  @Column({ type: "int", nullable: true })
  max_other_fees?: number;

  @Column({ type: "text", nullable: true })
  tution_fees_description?: string;

  @Column({ type: "json", nullable: true })
  other_fees?: string;

  @Column({ type: "smallint", nullable: true })
  year?: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  quota?: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  duration?: string;

  @Column({ type: "int", nullable: true })
  college_id?: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url?: string;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.collegewisefees, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "college_id" })
  college: CollegeInfo;

  @Column({ type: "int", nullable: true })
  collegewise_course_id: number;

  @Column({ type: "int", nullable: true })
  course_group_id: number;

  // @Column({ type: "int", nullable: true })
  // tution_fees: number;

  // @Column({ type: "int", nullable: true })
  // hostel_fees: number;

  // @Column({ type: "int", nullable: true })
  // admission_fees: number;

  // @Column({ type: "int", nullable: true })
  // exam_fees: number;

  // @Column({ type: "enum", enum: Category, nullable: true })
  // category: Category;

  // @Column({ type: "enum", enum: Type, nullable: true })
  // type: Type;

  @ManyToOne(() => CollegeWiseCourse, (course) => course.collegeWiseFees, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "collegewise_course_id" })
  collegeWiseCourse: CollegeWiseCourse;

  @ManyToOne(() => CourseGroup, (courseGroup) => courseGroup.collegeWiseFees, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "course_group_id" })
  courseGroup: CourseGroup;
}
