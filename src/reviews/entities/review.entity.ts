import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "../../authentication_module/users/users.entity";
import { CollegeInfo } from "src/college/college-info/college-info.entity";
import { CollegeWiseCourse } from "src/college/college-wise-course/college_wise_course.entity";

@Entity("reviews")
// @Unique(["email", "college_name"])
export class Review {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @CreateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "NOW()" })
  updated_at: Date;

  @Column({ nullable: true, type: "int" })
  college_id?: number;

  @Column({ nullable: true, type: "int" })
  course_id?: number;

  @ManyToOne(() => CollegeInfo, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "college_id" })
  college?: CollegeInfo;

  @ManyToOne(() => CollegeWiseCourse, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "course_id" })
  collegeCourse?: CollegeWiseCourse;

  @Column({ nullable: true })
  college_location?: string;

  @Column({ nullable: true, type: "int" })
  pass_year?: number;

  // Student Review Files
  @Column({ type: "text", nullable: true })
  linkedin_profile?: string;

  @Column({ type: "text", nullable: true })
  student_id_url?: string;

  @Column({ type: "text", nullable: true })
  mark_sheet_url?: string;

  @Column({ type: "text", nullable: true })
  degree_certificate_url?: string;

  @Column({ length: 200, nullable: true })
  review_title?: string;

  // College Images
  @Column("text", { array: true, nullable: true })
  college_images_urls?: string[];

  // Financial Information
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  annual_tuition_fees?: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  hostel_fees?: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  other_charges?: number;

  @Column({ type: "boolean", nullable: true })
  scholarship_availed?: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  scholarship_name?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  scholarship_amount?: number;

  // Detailed Feedback Fields
  @Column({ type: "int", nullable: true })
  overall_satisfaction_rating?: number;

  @Column({ type: "text", nullable: true })
  overall_experience_feedback?: string;

  @Column({ type: "int", nullable: true })
  teaching_quality_rating?: number;

  @Column({ type: "text", nullable: true })
  teaching_quality_feedback?: string;

  @Column({ type: "int", nullable: true })
  infrastructure_rating?: number;

  @Column({ type: "text", nullable: true })
  infrastructure_feedback?: string;

  @Column({ type: "int", nullable: true })
  library_rating?: number;

  @Column({ type: "text", nullable: true })
  library_feedback?: string;

  @Column({ type: "int", nullable: true })
  placement_support_rating?: number;

  @Column({ type: "text", nullable: true })
  placement_support_feedback?: string;

  @Column({ type: "int", nullable: true })
  administrative_support_rating?: number;

  @Column({ type: "text", nullable: true })
  administrative_support_feedback?: string;

  @Column({ type: "int", nullable: true })
  hostel_rating?: number;

  @Column({ type: "text", nullable: true })
  hostel_feedback?: string;

  @Column({ type: "int", nullable: true })
  extracurricular_rating?: number;

  @Column({ type: "text", nullable: true })
  extracurricular_feedback?: string;

  @Column({ type: "text", nullable: true })
  improvement_suggestions?: string;

  // Status tracking
  @Column({
    type: "varchar",
    length: 20,
    default: "pending",
  })
  status: "pending" | "approved" | "rejected";

  @Column({
    type: "varchar",
    length: 20,
    default: "pending",
  })
  reward_status: "pending" | "processed" | "paid";

  // Relation to user who submitted the review
  @Column({ nullable: true, type: "int" })
  user_id?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "user_id" })
  user?: User;
}
