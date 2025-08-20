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

  // Ratings (1-5 scale)
  @Column({ type: "int", nullable: true })
  campus_experience_rating?: number;

  @Column({ type: "int", nullable: true })
  placement_journey_rating?: number;

  @Column({ type: "int", nullable: true })
  academic_experience_rating?: number;

  @Column({ type: "int", nullable: true })
  college_admission_rating?: number;

  // Comments
  @Column({ type: "text", nullable: true })
  campus_experience_comment?: string;

  @Column({ type: "text", nullable: true })
  placement_journey_comment?: string;

  @Column({ type: "text", nullable: true })
  academic_experience_comment?: string;

  @Column({ type: "text", nullable: true })
  college_admission_comment?: string;

  // College Images
  @Column("text", { array: true, nullable: true })
  college_images_urls?: string[];

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
