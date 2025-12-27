import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./users.entity";

@Entity({ name: "account" })
export class Account {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  accountId: string;

  @Column({ type: "text" })
  providerId: string;

  @Index("account_userId_idx")
  @Column({ type: "text" })
  userId: string;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "text", nullable: true })
  accessToken: string | null;

  @Column({ type: "text", nullable: true })
  refreshToken: string | null;

  @Column({ type: "text", nullable: true })
  idToken: string | null;

  @Column({ type: "timestamptz", nullable: true })
  accessTokenExpiresAt: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  refreshTokenExpiresAt: Date | null;

  @Column({ type: "text", nullable: true })
  scope: string | null;

  @Column({ type: "text", nullable: true })
  password: string | null;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
