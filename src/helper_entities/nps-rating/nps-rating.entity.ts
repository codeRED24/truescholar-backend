import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class NpsRating {
  @PrimaryGeneratedColumn('increment')
  nps_rating_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  mobile_no: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'text' })
  feedback_query: string;

  @Column({ type: 'varchar', length: 500 })
  response_url: string;

  @Column({ type: 'varchar', length: 200 })
  location: string;
}
