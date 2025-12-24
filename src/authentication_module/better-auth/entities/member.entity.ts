import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./users.entity";
import { Organization } from "./organization.entity";

@Entity({ name: "member" })
export class Member {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Index("member_organizationId_idx")
  @Column({ type: "text" })
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.members, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Index("member_userId_idx")
  @Column({ type: "text" })
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "text" })
  role: string;

  @Column({ type: "timestamptz" })
  createdAt: Date;
}
