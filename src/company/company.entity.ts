import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "company" })
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", nullable: true })
  website: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text", nullable: true })
  logo: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
