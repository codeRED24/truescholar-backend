import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { SearchEntityType } from "@/common/enums";

@Entity({ name: "search_index" })
@Index(["entityType", "entityId"], { unique: true })
export class SearchIndex {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({
    type: "enum",
    enum: SearchEntityType,
  })
  entityType: SearchEntityType;

  @Index()
  @Column({ type: "text" })
  entityId: string;

  @Column({ type: "text" })
  indexedText: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
