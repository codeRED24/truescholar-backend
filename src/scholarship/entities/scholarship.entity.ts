import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum ScholarshipGender {
  MALE = "M",
  FEMALE = "F",
  BOTH = "Both",
}

@Entity()
export class Scholarship {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column("text", { nullable: true })
  provided_by: string;

  @Column({ nullable: true })
  meta_description: string;

  @Column("text", { nullable: true })
  description: string;

  @Column("text", { nullable: true })
  provider: string;

  @Column("text", { nullable: true })
  type: string;

  @Column("numeric", { nullable: true })
  amount: number;

  @Column("numeric", { nullable: true })
  percentage: number;

  @Column("text", { nullable: true })
  eligibility: string;

  @Column({ nullable: true })
  level: string;

  //   @Column("text", { nullable: true })
  //   courses_applicable: string;

  //   @Column("int", { array: true, nullable: true })
  //   colleges_applicable: number[];

  @Column({ nullable: true })
  category: string;

  @Column({
    type: "enum",
    enum: ScholarshipGender,
    default: ScholarshipGender.BOTH,
  })
  gender: ScholarshipGender;

  @Column({ type: "date", nullable: true })
  application_start_date: Date;

  @Column({ type: "date", nullable: true })
  application_end_date: Date;

  @Column("text", { nullable: true })
  application_process: string;

  @Column("text", { nullable: true })
  selection_process: string;

  @Column("text", { nullable: true })
  official_link: string;

  @Column("text", { nullable: true })
  document_required: string;

  @Column({ default: false })
  renewable: boolean;

  @Column({ nullable: true })
  number_of_awards: number;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  state: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  added_on: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_on: Date;

  @Column({ default: true })
  is_active: boolean;
}
