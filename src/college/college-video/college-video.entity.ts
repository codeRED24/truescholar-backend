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
export class CollegeVideo {
  @PrimaryGeneratedColumn()
  college_video_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  media_URL?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tag?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  alt_text?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail_URL?: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refrence_url?: string;

  @Column({ type: 'int', nullable: false })
  college_id?: number;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.collegeVideos, {
    nullable: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'college_id' })
  college: CollegeInfo;
}
