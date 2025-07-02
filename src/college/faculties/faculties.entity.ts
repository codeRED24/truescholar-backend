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
export class Faculties {
  @PrimaryGeneratedColumn()
  faculty_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ nullable: false })
  faculty_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  degree?: string;

  @Column({ type: 'smallint', nullable: true })
  experience_years?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string;

  @Column({ type: 'int', nullable: true })
  college_id?: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  refrence_url?: string;

  @Column({ nullable: true })
  specialization?: number;

  // Many-to-One relationship with CollegeInfo
  @ManyToOne(() => CollegeInfo, (collegeInfo) => collegeInfo.faculties, {
    nullable: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'college_id' })
  college: CollegeInfo;
}
