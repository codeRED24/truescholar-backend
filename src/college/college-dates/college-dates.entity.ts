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
export class CollegeDates {
  @PrimaryGeneratedColumn()
  college_dates_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ nullable: true })
  college_id: number;

  @Column({ type: 'date', nullable: true }) 
  start_date: Date;

  @Column({ type: 'date', nullable: true }) 
  end_date: Date;

  @Column({ nullable: true })
  event?: string;

  @Column({nullable: true, type: Boolean})
  is_confirmed: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refrence_url?: string;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.collegeContents, {
    nullable: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'college_id' })
  college: CollegeInfo;
}
