import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
  OneToMany,
} from "typeorm";
import { Course } from "../../courses_module/courses/courses.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
@Entity()
@Unique(["slug"])
export class Specialization {
  @PrimaryGeneratedColumn()
  specialization_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  slug: string;

  @Column({ type: "varchar", length: 500 })
  name: string;

  @Column({ nullable: true })
  full_name?: string;

  @Column({ nullable: true, default: true })
  is_active?: boolean;

  @Column({
    type: "decimal",
    precision: 3,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  kapp_score?: number;

  @OneToMany(() => Course, (course) => course.specialization)
  courses: Course[];
}
