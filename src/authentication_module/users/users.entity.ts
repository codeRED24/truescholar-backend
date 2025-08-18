import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  kapp_uuid1: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ unique: true })
  custom_id: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ unique: true, nullable: true })
  username?: string;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ nullable: true })
  priority?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  designation?: string;

  @Column({ nullable: true, type: 'date' })
  date_of_birth?: string;

  @Column({ nullable: true })
  tenth_board?: string;

  @Column({ nullable: true, type: 'decimal' })
  tenth_percentage?: string;

  @Column({ nullable: true, type: 'int' })
  tenth_pass_year?: number;

  @Column({ nullable: true })
  twelth_board?: string;

  @Column({ nullable: true, type: 'decimal' })
  twelth_percentage?: string;

  @Column({ nullable: true, type: 'int' })
  twelth_pass_year?: number;

  @Column({ nullable: true })
  student_city?: string;

  @Column({ nullable: true })
  student_state?: string;

  @Column({ nullable: true })
  interest_incourse?: string;

  @Column({ nullable: true, type: 'int' })
  year_intake?: number;

  @Column({ nullable: true })
  insti_name?: string;

  @Column({ nullable: true })
  insti_city?: string;

  @Column({ nullable: true })
  insti_designation?: string;

  @Column({ nullable: true })
  insti_purpose?: string;

  @Column({ nullable: true })
  user_team?: string;

  @Column({ nullable: true })
  mobile?: string;

  @Column({ nullable: true })
  role?: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: false })
  otp_verified: boolean;

  @Column({ nullable: true })
  otp: string;
}
