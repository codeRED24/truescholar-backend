import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { User } from "../authentication_module/better-auth/entities/users.entity";
import { CollegeInfo } from "../college/college-info/college-info.entity";
import { AuthorType } from "../common/enums";

@Entity({ name: "follow_college" })
// Unique constraint relaxed here, will be managed by DB or service logic for the complex case
export class FollowCollege {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "text" })
  followerId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "followerId" })
  follower: User;

  @Index()
  @Column({ type: "int" })
  collegeId: number;

  @ManyToOne(() => CollegeInfo, { onDelete: "CASCADE" })
  @JoinColumn({ name: "collegeId" })
  college: CollegeInfo;

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
