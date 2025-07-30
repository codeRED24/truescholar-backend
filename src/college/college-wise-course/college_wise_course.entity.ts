import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm";

import { CollegeInfo } from "../college-info/college-info.entity";
import { Course } from "../../courses_module/courses/courses.entity";
import { CollegeWiseFees } from "../college-wise-fees/college-wise-fees.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { CollegeCutoff } from "../college-cutoff/college_cutoff.entity";
import { Author } from "../../articles_modules/author/author.entity";
@Entity()
@Index("IDX_COLLEGE_ID_COURSE_GROUP_ID", [
  "college_id",
  "course_group_id",
  "college_wise_course_id",
])
export class CollegeWiseCourse {
  @PrimaryGeneratedColumn()
  college_wise_course_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "varchar", length: 400, nullable: true })
  name: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description?: string;

  @Column({ type: "int", nullable: true })
  fees?: number;

  @Column({ type: "int", nullable: true })
  salary?: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  eligibility?: string;

  @Column({ type: "text", nullable: true })
  eligibility_description?: string;

  @Column({ type: "boolean", nullable: true })
  is_online?: boolean;

  @Column({ type: "varchar", length: 300, nullable: true })
  level?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  course_format?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  degree_type?: string;

  @Column({ type: "boolean", nullable: true })
  is_integrated_course?: boolean;

  @Column({ type: "varchar", length: 50, nullable: true })
  duration_type?: string;

  @Column({ type: "smallint", nullable: true })
  duration?: string;

  @Column({ type: "text", nullable: true })
  highlight?: string;

  @Column({ type: "text", nullable: true })
  admission_process?: string;

  @Column({ type: "text", nullable: true })
  overview?: string;

  @Column({ type: "int", nullable: true })
  total_seats?: number;

  @Column({ type: "text", nullable: true })
  syllabus?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  course_brochure?: string;

  @Column({ type: "decimal", nullable: true })
  kapp_score?: number;

  @Column({ type: "decimal", nullable: true })
  kapp_rating?: number;

  @Column({ type: "int", nullable: false })
  college_id: number;

  @Column({ type: "int", nullable: true })
  stage_id?: number;

  @Column({ type: "int", nullable: true })
  course_id: number;

  @Column({ type: "boolean", default: true, nullable: true })
  is_active: boolean;

  @Column({ type: "int", nullable: false })
  course_group_id?: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url?: string;

  @ManyToOne(
    () => CourseGroup,
    (courseGroup) => courseGroup.collegeWiseCourses,
    {
      nullable: false,
      onDelete: "SET NULL",
    }
  )
  @JoinColumn({ name: "course_group_id" })
  courseGroup: CourseGroup;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.collegeCourses, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "college_id" })
  college: CollegeInfo;

  // Many-to-One relationship with Courses
  @ManyToOne(() => Course, (course) => course.collegeCourses, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "course_id" })
  courses: Course;

  // One-to-Many relationship with CollegeWiseFees
  @OneToMany(() => CollegeWiseFees, (fees) => fees.collegeWiseCourse)
  collegeWiseFees: CollegeWiseFees[];

  @OneToMany(() => CollegeCutoff, (cutoff) => cutoff.collegeWiseCourse)
  collegeCutoffs: CollegeCutoff[];
}
