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
import { AuthorType } from "../common/enums";
import { CollegeInfo } from "../college/college-info/college-info.entity";

@Entity({ name: "like" })
// Unique constraints handled by database index for Option B support:
// UNIQUE(userId, postId, COALESCE(collegeId, -1))
// UNIQUE(userId, commentId, COALESCE(collegeId, -1))
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

  @Column({
    type: "enum",
    enum: AuthorType,
    default: AuthorType.USER,
  })
  authorType: AuthorType;

  @Index()
  @Column({ type: "int", nullable: true })
  collegeId: number | null;

  @ManyToOne(() => CollegeInfo, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "collegeId" })
  college: CollegeInfo | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
