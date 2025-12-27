import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity({ name: "verification" })
export class Verification {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Index("verification_identifier_idx")
  @Column({ type: "text" })
  identifier: string;

  @Column({ type: "text" })
  value: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
