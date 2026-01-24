import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
  Unique,
} from "typeorm";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { AuthorType } from "../common/enums";
import { CollegeInfo } from "../college/college-info/college-info.entity";

@Entity({ name: "follow" })
// Unique constraints handled by database index logic or migration to support conditional uniqueness:
// - If USER: (followerId, followingId) unique
// - If COLLEGE: (followerCollegeId, followingId) unique
// For now, we relax the strict class-level decorator which might conflict with nullable columns
export class Follow {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "text" })
  followerId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "followerId" })
  follower: User;

  @Index()
  @Column({ type: "text" })
  followingId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "followingId" })
  following: User;

  @Column({
    type: "enum",
    enum: AuthorType,
    default: AuthorType.USER,
  })
  authorType: AuthorType;

  @Index()
  @Column({ type: "int", nullable: true })
  followerCollegeId: number | null;

  @ManyToOne(() => CollegeInfo, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "followerCollegeId" })
  followerCollege: CollegeInfo | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
