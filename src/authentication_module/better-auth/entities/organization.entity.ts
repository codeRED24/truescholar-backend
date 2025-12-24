import { Entity, Column, PrimaryColumn, Index, OneToMany } from "typeorm";
import { Member } from "./member.entity";
import { Invitation } from "./invitation.entity";

@Entity({ name: "organization" })
export class Organization {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  name: string;

  @Index("organization_slug_uidx", { unique: true })
  @Column({ type: "text", unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  logo: string | null;

  @Column({ type: "timestamptz" })
  createdAt: Date;

  @Column({ type: "text", nullable: true })
  metadata: string | null;

  @OneToMany(() => Member, (member) => member.organization)
  members: Member[];

  @OneToMany(() => Invitation, (invitation) => invitation.organization)
  invitations: Invitation[];
}
