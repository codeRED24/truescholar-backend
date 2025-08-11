import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { Country } from "../../helper_entities/country/country.entity";
import { City } from "../../helper_entities/cities/city.entity";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { ListingContent } from "../listing-content/listing-content.entity";
@Entity()
@Unique(["slug"])
export class State {
  @PrimaryGeneratedColumn("increment")
  state_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @Column("text", { nullable: true })
  description: string;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "varchar", length: 300 })
  name: string;

  @Column({ nullable: false, type: "varchar", length: 100 })
  slug?: string;

  @Column({ type: "boolean", default: true, nullable: true })
  is_active: boolean;

  @Column({
    type: "decimal",
    precision: 3,
    scale: 2,
    default: 0.0,
    nullable: true,
  })
  kapp_score: number;

  @OneToMany(() => CollegeInfo, (college_info) => college_info.city)
  college_infos: CollegeInfo[];

  @ManyToOne(() => Country, (country) => country.states, {
    nullable: false,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "country_id" })
  country: Country;

  @OneToMany(() => City, (city) => city.state)
  cities: City[];

  @OneToMany(() => ListingContent, (listingContent) => listingContent.state)
  listingContents: ListingContent[];
}
