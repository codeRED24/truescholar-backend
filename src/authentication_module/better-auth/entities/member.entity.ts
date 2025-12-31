import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./users.entity";
import { CollegeInfo } from "../../../college/college-info/college-info.entity";

@Entity({ name: "member" })
export class Member {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Index()
  @Column({ type: "int" })
  collegeId: number;

  @ManyToOne(() => CollegeInfo, { onDelete: "CASCADE" })
  @JoinColumn({ name: "collegeId", referencedColumnName: "college_id" })
  college: CollegeInfo;

  @Index()
  @Column({ type: "text" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "text" })
  role: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
