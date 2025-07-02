import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  OneToMany,
} from "typeorm";

import { Course } from "../courses/courses.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { CollegeWiseCourse } from "../../college/college-wise-course/college_wise_course.entity";
import { CourseType } from "../../common/enums";
import { CourseLevel } from "../../common/enums";
import { LeadForm } from "../../helper_entities/lead-form/lead-form.entity";
import { CollegeRanking } from "../../college/college-ranking/college-ranking.entity";
import { ContactUs } from "../../helper_entities/contact-us/contact-us.entity";
import { CollegeWiseFees } from "../../college/college-wise-fees/college-wise-fees.entity";
import { CollegeCutoff } from "../../college/college-cutoff/college_cutoff.entity";
import { CollegeExam } from "../../college/college_exam/college_exam.entity";
import { ListingContent } from "../../helper_entities/listing-content/listing-content.entity";
@Entity()
@Index("IDX_COLLEGE_COURSEGROUP", ["stream_id", "course_group_id"])
@Unique(["slug"])
export class CourseGroup {
  @PrimaryGeneratedColumn("increment")
  course_group_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "decimal", nullable: true })
  kapp_score?: number;

  @Column({ type: "varchar", length: 100, nullable: true, unique: true })
  slug?: string;

  @Column({ type: "varchar", length: 400 })
  name: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  full_name?: string;

  @Column({
    type: "enum",
    enum: CourseType,
    nullable: true,
  })
  type?: CourseType;

  @Column({
    type: "enum",
    enum: CourseLevel,
    nullable: true,
  })
  level?: CourseLevel;

  @Column({ type: "smallint", nullable: true })
  duration_in_months?: number;

  @Column({ type: "int", nullable: true })
  stream_id?: number;

  // Many-to-One relationship with stream
  @ManyToOne(() => Stream, (stream) => stream.course_group, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "stream_id" })
  stream: Stream;

  @OneToMany(() => Course, (course) => course.courseGroup)
  courses: Course[];

  @OneToMany(
    () => CollegeWiseCourse,
    (collegeWiseCourse) => collegeWiseCourse.courseGroup
  )
  collegeWiseCourses: CollegeWiseCourse[];

  @OneToMany(
    () => CollegeRanking,
    (collegeRanking) => collegeRanking.courseGroup
  )
  collegeRankings: CollegeRanking[];

  @OneToMany(() => LeadForm, (leadForm) => leadForm.course_group)
  leadForms: LeadForm[];

  @OneToMany(() => ContactUs, (contactUs) => contactUs.course_group)
  contactUs: ContactUs[];

  @OneToMany(
    () => CollegeWiseFees,
    (collegeWiseFees) => collegeWiseFees.courseGroup
  )
  collegeWiseFees: CollegeWiseFees[];

  @OneToMany(() => CollegeCutoff, (collegeCutoff) => collegeCutoff.courseGroup)
  collegeCutoffs: CollegeCutoff[];

  @OneToMany(() => CollegeExam, (collegeExam) => collegeExam.courseGroup)
  collegeExams: CollegeExam[];

  @OneToMany(() => ListingContent, (listingContent) => listingContent.courseGroup)
  listingContents: ListingContent[];
}
