import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { City } from "../../helper_entities/cities/city.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";

@Entity()
export class LeadForm {
  @PrimaryGeneratedColumn("increment")
  lead_form_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  email: string;

  @Column({ type: "varchar", length: 20, nullable: false })
  mobile_no: string;

  @Column({ type: "int" })
  course_group_id: number;

  @Column({ type: "int" })
  college_id: number;

  @Column({ type: "int" })
  city_id: number;

  @Column({ type: "varchar", length: 500 })
  response_url: string;

  @Column({ type: "varchar", length: 200 })
  location: string;

  @Column({ type: "boolean", default: false })
  not_sure: boolean;

  @Column({ type: "int", nullable: true })
  preferred_city: number;

  // Many-to-One relationship with CourseGroup
  @ManyToOne(() => CourseGroup, (courseGroup) => courseGroup.leadForms, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "course_group_id" })
  course_group: CourseGroup;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.leadForms, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "college_id" })
  college: CollegeInfo;

  // Many-to-One relationship with City
  @ManyToOne(() => City, (city) => city.leadForms, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "city_id" })
  city: City;
}
