import { UUID } from "crypto";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from "typeorm";
import { CollegeWiseCourse } from "../../college/college-wise-course/college_wise_course.entity";
import { Specialization } from "../../specializations/specialization/specialization.entity";
import { CourseGroup } from "../course-group/course_group.entity";
import {
  CourseLevel,
  DurationType,
  CourseType,
  CourseLevels,
  CourseMode,
} from "../../common/enums";
import { Stream } from "../../helper_entities/stream/stream.entity";

@Entity("courses")
@Unique(["slug"])
export class Course {
  @PrimaryGeneratedColumn("increment")
  course_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: "varchar", nullable: true })
  last_edited_by: string;

  @Column({ type: "varchar", length: 500 })
  course_name: string;

  @Column({ type: "boolean", nullable: true })
  is_online: boolean;

  @Column({ type: "varchar", length: 400, nullable: true })
  short_name: string;

  @Column("text", { nullable: true })
  description: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  slug: string;

  @Column({ type: "int", nullable: true })
  duration: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  last_update: string;

  @Column({ type: "boolean", nullable: true, default: true })
  is_active: boolean;

  @Column({ type: "boolean", nullable: true })
  is_approved: boolean;

  @Column({ type: "int", nullable: true })
  course_code: string;

  @Column({ type: "boolean", nullable: true })
  online_only: boolean;

  @Column("decimal", { nullable: true })
  kap_score: number;

  @Column({ nullable: true })
  key_article: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  course_format: string;

  @Column({ nullable: true })
  degree_type: string;

  @Column({ nullable: true, default: false, type: "boolean" })
  is_integrated_course: boolean;

  @Column({ nullable: true })
  eligibility: string;

  @Column({ type: "enum", enum: CourseLevel, nullable: true })
  level: CourseLevel;

  @Column({ type: "int", nullable: true })
  course_group_id: number;

  @Column({ type: "int", nullable: true })
  duration_value: number;

  @Column({ type: "enum", enum: DurationType, nullable: true })
  duration_type: DurationType;

  @Column({ type: "enum", enum: CourseType, nullable: true })
  course_type: CourseType;

  // @Column({ type: "enum", enum: CourseMode, nullable: true })
  // course_mode: CourseMode;

  @Column({ type: "enum", enum: CourseLevels, nullable: true })
  course_level: CourseLevels;

  @Column({ type: "int", nullable: true })
  stream_id: number;

  @ManyToOne(() => CourseGroup, (courseGroup) => courseGroup.courses, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "course_group_id" })
  courseGroup: CourseGroup;

  @OneToMany(() => CollegeWiseCourse, (collegeCourse) => collegeCourse.college)
  collegeCourses: CollegeWiseCourse[];

  @Column({ type: "int", nullable: true })
  specialization_id: number;

  @ManyToOne(() => Specialization, (specialization) => specialization.courses, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @ManyToOne(() => Stream, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "stream_id" })
  stream: Stream;

  @JoinColumn({ name: "specialization_id" })
  college: Specialization;
}
