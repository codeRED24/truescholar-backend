import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from "typeorm";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { LeadForm } from "../../helper_entities/lead-form/lead-form.entity";
import { Country } from "../country/country.entity";
import { State } from "../state/state.entity";
import { ListingContent } from "../listing-content/listing-content.entity";

@Entity()
@Unique(["slug"])
export class City {
  @PrimaryGeneratedColumn("increment")
  city_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ type: "varchar", length: 300 })
  name: string;

  @Column("text", { nullable: true })
  description: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  slug: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  logo_url: string;

  @Column({ type: "boolean", nullable: true, default: true })
  is_active: boolean;

  @Column({
    type: "decimal",
    nullable: true,
    default: 0.0,
  })
  kapp_score?: number;

  @ManyToOne(() => State, (state) => state.cities, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "state_id" })
  state: State;

  @ManyToOne(() => Country, (country) => country.cities, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "country_id" })
  country: Country;

  // @ManyToMany(() => Exam, (exam) => exam.exam_center_city)
  // exams: Exam[];

  @OneToMany(() => CollegeInfo, (college_info) => college_info.city)
  college_infos: CollegeInfo[];

  @OneToMany(() => LeadForm, (leadForm) => leadForm.city)
  leadForms: LeadForm[];

  @OneToMany(() => ListingContent, (listingContent) => listingContent.city)
  listingContents: ListingContent[];
}
