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
export class CollegeHostelCampus {
  @PrimaryGeneratedColumn()
  college_hostelcampus_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refrence_url?: string;

  @Column({ type: 'int', nullable: true })
  college_id?: number;

  @Column({ nullable: true })
  description?: string;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(
    () => CollegeInfo,
    (collegeInfo) => collegeInfo.collegeHostelCampuss,
    {
      nullable: false,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'college_id' })
  college: CollegeInfo;
}
