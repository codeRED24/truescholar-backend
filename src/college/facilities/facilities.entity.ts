import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['slug'])
export class Facilities {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  slug?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  meta_desc?: string;

  @Column({ nullable: true })
  og_img?: string;

  @Column({ nullable: true })
  og_title?: string;

  @Column({ nullable: true })
  priority_rank?: number;

  @Column({ nullable: true })
  priority_bool?: boolean;

  @Column({ nullable: true })
  last_edited_by?: string;

  @Column({ nullable: true })
  card_img_url?: string;

  @Column('text', { array: true, nullable: true })
  img_arr?: string[];

  @Column()
  IsPublished: boolean;
}
