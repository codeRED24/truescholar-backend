import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum EntityType {
  USER = "user",
  COLLEGE = "college",
  COMPANY = "company",
}

@Entity({ name: "entity_handle" })
export class EntityHandle {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index({ unique: true })
  @Column({ type: "text", unique: true })
  handle: string; // The @username (lowercase)

  @Index()
  @Column({ type: "enum", enum: EntityType })
  entityType: EntityType;

  @Index()
  @Column({ type: "text" })
  entityId: string; // ID of the User, College, or Company

  @Column({ type: "text", nullable: true })
  displayName: string; // Cached name for search

  @Column({ type: "text", nullable: true })
  image: string; // Cached avatar/logo for search

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
