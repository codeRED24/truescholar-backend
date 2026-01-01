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
import { Post } from "../posts/post.entity";

@Entity({ name: "comment" })
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "uuid" })
  postId: string;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post: Post;

  @Index()
  @Column({ type: "text" })
  authorId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "authorId" })
  author: User;

  @Column({ type: "uuid", nullable: true })
  parentId: string | null;

  @ManyToOne(() => Comment, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "parentId" })
  parent: Comment | null;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "int", default: 0 })
  likeCount: number;

  @Column({ type: "boolean", default: false })
  isDeleted: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
