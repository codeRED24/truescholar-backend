import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CollegeInfo } from "../college-info/college-info.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
@Entity()
export class CollegeRanking {
  @PrimaryGeneratedColumn()
  college_ranking_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "int", nullable: true })
  college_id?: number;

  @Column({ type: "int", nullable: true })
  ranking_agency_id?: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  agency?: string;

  @Column({ type: "int", nullable: true })
  rank?: number;

  @Column({ type: "int", nullable: true })
  course_group_id?: number;

  @Column({ type: "int", nullable: true })
  stream_id?: number;

  @Column({ type: "varchar", length: 1500, nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 1000, nullable: true })
  category?: string;

  @Column({ type: "smallint", nullable: true })
  year?: number;

  @Column({ type: "varchar", length: 400, nullable: true })
  rank_title?: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  rank_subtitle?: string;

  @Column({ type: "varchar", length: 700, nullable: true })
  refrence_url?: string;

  @Column({ type: "varchar", nullable: true })
  max_rank?: string;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.collegeRankings, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "college_id" })
  college: CollegeInfo;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => Stream, (stream) => stream.collegeRankings, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "stream_id" })
  stream: Stream;

  // Many-to-One relationship with CourseGroup
  @ManyToOne(() => CourseGroup, (courseGroup) => courseGroup.collegeRankings, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "course_group_id" })
  courseGroup: CourseGroup;
}
