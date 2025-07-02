import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from "typeorm";

import { Article } from "../articles/articles.entity";
import { ExamContent } from "../../exams_module/exam-content/exam_content.entity";
import { CollegeContent } from "../../college/college-content/college-content.entity";

@Entity()
@Index("IDX_AUTHOR_VIEW_NAME", ["view_name"]) 
@Index("IDX_AUTHOR_ACTIVE", ["is_active"]) 
export class Author {
  @PrimaryGeneratedColumn()
  author_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "varchar", length: 100, nullable: true })
  author_name: string;

  @Column({ type: "varchar", length:100, nullable: true})
  email: string;

  @Column({ nullable: true })
  view_name?: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: "text", nullable: true })
  about?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  image?: string;

  @Column({type: "varchar", nullable: true})
  role?: string;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @OneToMany(() => ExamContent, (examContent) => examContent.author, {
    cascade: false,
  })
  examContents: ExamContent[];

  @OneToMany(() => CollegeContent, (collegeContent) => collegeContent.author, {
    cascade: false,
  })
  collegeContents: CollegeContent[];
}
