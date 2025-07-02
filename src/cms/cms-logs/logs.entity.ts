import { LogType, RequestType } from "../../common/enums";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CmsUser } from "../auth/auth.entity";

@Entity()
export class Logs {
  @PrimaryGeneratedColumn("increment")
  log_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @Column({ type: "int" })
  user_id: number;

  @Column({
    type: "enum",
    enum: LogType,
  })
  type?: LogType;

  @Column("varchar", { length: 500, nullable: true })
  description: string;

  @Column("int", { default: 1 })
  priority: number;

  @Column("json", { nullable: true })
  metaData: Record<string, any>;

  @Column({
    type: "enum",
    enum: RequestType,
  })
  requestType: RequestType;

  @Column("int")
  reference_id: number;

  @ManyToOne(() => CmsUser)
  @JoinColumn({ name: "user_id" })
  user: CmsUser;
}
