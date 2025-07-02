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
export class CollegeScholarship {
  @PrimaryGeneratedColumn()
  college_scholarship_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column()
  custom_id: string;

  @Column({ nullable: false })
  college_id: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refrence_url?: string;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(
    () => CollegeInfo,
    (collegeInfo) => collegeInfo.collegeScholarships,
    {
      nullable: false,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'college_id' })
  college: CollegeInfo;
}
