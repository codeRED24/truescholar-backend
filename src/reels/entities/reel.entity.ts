import { User } from "src/authentication_module/users/users.entity";
import { CollegeInfo } from "src/college/college-info/college-info.entity";
import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity({ name: "reels" })
export class Reel {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "reel_url", type: "text" })
  reel_url: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  type: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updated_at: Date;

  @Index()
  @Column({ nullable: true, type: "int" })
  college_id?: number;

  @ManyToOne(() => CollegeInfo, { onDelete: "SET NULL" })
  @JoinColumn({ name: "college_id" })
  college?: CollegeInfo;

  @Index()
  @Column({ nullable: true, type: "int" })
  user_id?: number;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "user_id" })
  user?: User;
}
