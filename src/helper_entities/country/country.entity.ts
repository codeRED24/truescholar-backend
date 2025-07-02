import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { City } from "../../helper_entities/cities/city.entity";
import { State } from "../../helper_entities/state/state.entity";
import { CollegeInfo } from "../../college/college-info/college-info.entity";

@Entity()
export class Country {
  @PrimaryGeneratedColumn("increment")
  country_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  slug?: string;

  @Column({ nullable: true, default: true })
  is_active: boolean;

  @Column({ type: "decimal", precision: 3, scale: 2, nullable: true })
  kapp_score: number;

  @OneToMany(() => CollegeInfo, (college_info) => college_info.country)
  college_infos: CollegeInfo[];

  @OneToMany(() => State, (state) => state.country)
  states: State[];

  @OneToMany(() => City, (city) => city.country)
  cities: City[];
}
