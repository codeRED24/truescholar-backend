import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from "typeorm";

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
}

@Entity({ name: "post_media_upload" })
export class PostMediaUpload {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  url: string;

  @Column({
    type: "enum",
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  type: MediaType;

  @Index()
  @Column({ type: "text" })
  uploaderId: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
