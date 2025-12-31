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

@Entity({ name: "follow_college" })
@Unique(["followerId", "collegeId"])
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

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
