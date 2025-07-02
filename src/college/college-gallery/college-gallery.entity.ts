import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CollegeInfo } from '../college-info/college-info.entity';
@Entity()
export class CollegeGallery {
  @PrimaryGeneratedColumn()
  college_gallery_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  media_URL?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tag?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  alt_text?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', nullable: true })
  college_id?: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refrence_url?: string;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.collegegGallerys, {
    nullable: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'college_id' })
  college: CollegeInfo;
}
