import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
  Index,
} from "typeorm";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { CollegeRanking } from "../../college/college-ranking/college-ranking.entity";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
import { ListingContent } from "../listing-content/listing-content.entity";
@Entity()
@Index("IDX_COLLEGE_STREAM_ID", ["stream_id", "kapp_score", "stream_name"])
@Unique(["slug"])
export class Stream {
  @PrimaryGeneratedColumn("increment")
  stream_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "varchar", length: 300, nullable: true })
  stream_name: string;

  @Column("text", { nullable: true })
  description: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  logo_url: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  slug?: string;

  @Column({ nullable: true, default: true })
  is_active?: boolean;

  @Column({
    type: "decimal",
    nullable: true,
    default: 0.0,
  })
  kapp_score?: number;

  @Column({ nullable: true, default: false })
  is_online?: boolean;

  @OneToMany(() => CourseGroup, (specialization) => specialization.stream)
  course_group: CourseGroup[];

  @OneToMany(() => CollegeRanking, (collegeRanking) => collegeRanking.stream)
  collegeRankings: CollegeRanking[];

  @OneToMany(() => CollegeInfo, (collegeInfo) => collegeInfo.primaryStream)
  collegeInfos: CollegeInfo[];

  @OneToMany(() => Exam, (exam) => exam.stream)
  exam: Exam[];

  @OneToMany(() => ListingContent, (listingContent) => listingContent.stream)
  listingContents: ListingContent[];
}
