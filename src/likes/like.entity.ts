import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  Check,
} from "typeorm";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { Post } from "../posts/post.entity";
import { Comment } from "../comments/comment.entity";

@Entity({ name: "like" })
@Unique(["userId", "postId"])
@Unique(["userId", "commentId"])
@Check(
  `("postId" IS NOT NULL AND "commentId" IS NULL) OR ("postId" IS NULL AND "commentId" IS NOT NULL)`
)
export class Like {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "text" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Index()
  @Column({ type: "uuid", nullable: true })
  postId: string | null;

  @ManyToOne(() => Post, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "postId" })
  post: Post | null;

  @Index()
  @Column({ type: "uuid", nullable: true })
  commentId: string | null;

  @ManyToOne(() => Comment, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "commentId" })
  comment: Comment | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
