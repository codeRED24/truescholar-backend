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
import { Organization } from "./organization.entity";

@Entity({ name: "invitation" })
export class Invitation {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Index("invitation_organizationId_idx")
  @Column({ type: "text" })
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.invitations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Index("invitation_email_idx")
  @Column({ type: "text" })
  email: string;

  @Column({ type: "text", nullable: true })
  role: string | null;

  @Column({ type: "text" })
  status: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "text" })
  inviterId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "inviterId" })
  inviter: User;
}
