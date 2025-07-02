import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";

@Entity()
export class ContactUs {
  @PrimaryGeneratedColumn("increment")
  contact_us_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true})
  name: string;

  @Column({ type: "varchar", length: 255, nullable: true})
  role: string;

  @Column({ type: "varchar", length: 20 })
  mobile_no: string;

  @Column({ type: "text" })
  query: string;

  @Column({ type: "varchar", length: 500 })
  response_url: string;

  @Column({ type: "varchar", length: 200 })
  location: string;

  @Column({ type: "int", nullable: true })
  course_group_id: number;

  @ManyToOne(() => CourseGroup, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "course_group_id" })
  course_group: CourseGroup;
}
