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

@Entity({ name: "follow" })
@Unique(["followerId", "followingId"])
@Check(`"followerId" != "followingId"`)
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

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
