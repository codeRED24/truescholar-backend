import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import { AuthorType, PostType } from "@/common/enums";

export enum PostVisibility {
  PUBLIC = "public",
  CONNECTIONS = "connections",
  PRIVATE = "private",
  COLLEGE = "college",
}

export interface PostMedia {
  url: string;
  type: "image" | "video" | "document";
  thumbnailUrl?: string;
  altText?: string;
}

@Entity({ name: "post" })
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "text" })
  authorId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "authorId" })
  author: User;

  @Column({
    type: "enum",
    enum: AuthorType,
    default: AuthorType.USER,
  })
  authorType: AuthorType;

  @Column({
    type: "enum",
    enum: PostType,
    default: PostType.GENERAL,
  })
  type: PostType;

  @Index()
  @Column({ type: "int", nullable: true })
  taggedCollegeId?: number;

  @ManyToOne(() => CollegeInfo, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "taggedCollegeId" })
  taggedCollege?: CollegeInfo;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "jsonb", default: [] })
  media: PostMedia[];

  @Column({
    type: "enum",
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility;

  @Column({ type: "int", default: 0 })
  likeCount: number;

  @Column({ type: "int", default: 0 })
  commentCount: number;

  @Column({ type: "boolean", default: false })
  isDeleted: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
