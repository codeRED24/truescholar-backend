import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Author } from "../author/author.entity";
import { StatusType, ArticleType } from "../../common/enums";
import { ArticleMapping } from "../../cms/articles/articles-mapping.entity";

@Entity()
@Unique(["slug"])
export class Article {
  @PrimaryGeneratedColumn("increment")
  article_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  sub_title: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  approved_by: string;

  @Column()
  slug: string;

  @Column({ nullable: false, type: "number" })
  author_id: number;

  @Column({ nullable: true })
  publication_date: string;

  @Column({ nullable: true })
  read_time: number;

  @Column({ nullable: true, default: false })
  is_active: boolean;

  @Column({ nullable: true, type: "text" })
  content: string;

  @Column({
    type: "enum",
    enum: ArticleType,
    default: ArticleType.ARTICLE,
  })
  type: ArticleType;

  @Column({ nullable: true })
  tags: string;

  @Column({ type: "varchar", nullable: true })
  meta_desc: string;

  @Column({ type: "varchar", nullable: true })
  img1_url: string;

  @Column({ type: "varchar", nullable: true })
  img2_url: string;

  @Column({ nullable: true })
  assigned_to: string;

  @Column({ nullable: true })
  stage_id: number;

  @Column({ type: "enum", enum: StatusType, default: StatusType.PENDING })
  status: StatusType;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => Author, (collegeInfo) => collegeInfo.articles, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "author_id" })
  author: Author;

  @OneToMany(() => ArticleMapping, (mapping) => mapping.article_id, {
    cascade: true,
  })
  mappings_id: ArticleMapping[];
}
