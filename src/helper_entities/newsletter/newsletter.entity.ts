import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Newsletter {
  @PrimaryGeneratedColumn("increment")
  newsletter_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 20 })
  mobile_no: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  response_url: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  location: string;
}
