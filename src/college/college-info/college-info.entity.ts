import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { InstituteType } from "../../common/enums";
import { CollegeContent } from "../college-content/college-content.entity";
import { CollegeGallery } from "../college-gallery/college-gallery.entity";
import { CollegeVideo } from "../college-video/college-video.entity";
import { CollegeWiseFees } from "../college-wise-fees/college-wise-fees.entity";
import { CollegeWisePlacement } from "../college-wise-placement/college-wise-placement.entity";
import { CollegeScholarship } from "../college-scholarship/college-scholarship.entity";
import { CollegeHostelCampus } from "../college-hostel-and-campus/college-hostel-and-campus.entity";
import { CollegeDates } from "../college-dates/college-dates.entity";
import { CollegeCutoff } from "../college-cutoff/college_cutoff.entity";
import { CollegeRanking } from "../college-ranking/college-ranking.entity";
import { CollegeExam } from "../college_exam/college_exam.entity";
import { Faculties } from "../faculties/faculties.entity";
import { City } from "../../helper_entities/cities/city.entity";
import { State } from "../../helper_entities/state/state.entity";
import { Country } from "../../helper_entities/country/country.entity";
import { CollegeWiseCourse } from "../college-wise-course/college_wise_course.entity";
import { Stream } from "../../helper_entities/stream/stream.entity";
import { LeadForm } from "../../helper_entities/lead-form/lead-form.entity";
import { Member } from "../../authentication_module/better-auth/entities/member.entity";
import { Invitation } from "../../authentication_module/better-auth/entities/invitation.entity";
import { FollowCollege } from "../../followers/follow-college.entity";

@Entity()
@Unique(["slug"])
@Index("IDX_COLLEGE_ID_KAPP_SCORE", ["college_id", "kapp_score"])
export class CollegeInfo {
  @PrimaryGeneratedColumn("increment")
  college_id: number;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @Column({ default: false })
  is_active: boolean;

  @Column({ default: false })
  is_online: boolean;

  @Column({ default: false })
  girls_only: boolean;

  @Column({ type: "varchar", length: 700, nullable: true })
  college_name: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  short_name?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  slug?: string;

  @Column({ type: "varchar", length: 700, nullable: true })
  search_names?: string;

  @Column({ type: "int", nullable: true })
  parent_college_id?: number;

  @Column({ type: "int", nullable: true })
  city_id?: number;

  @Column({ type: "int", nullable: true })
  state_id?: number;

  @Column({ type: "int", nullable: true })
  country_id?: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  location?: string;

  @Column({ type: "char", length: 6, nullable: true })
  PIN_code?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  latitude_longitude?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  college_email?: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  college_phone?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  college_website?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  refrence_url?: string;

  @Column({
    type: "enum",
    enum: InstituteType,
    nullable: true,
  })
  type_of_institute?: InstituteType;

  @Column({ type: "int", nullable: true })
  affiliated_university_id?: number;

  @Column({ type: "char", length: 4, nullable: true })
  founded_year?: string;

  @Column({ type: "varchar", length: 800, nullable: true })
  logo_img?: string;

  @Column({ type: "varchar", length: 8, nullable: true })
  nacc_grade?: string;

  @Column({ type: "varchar", length: 800, nullable: true })
  banner_img?: string;

  @Column({ type: "int", nullable: true })
  total_student?: number;

  @Column({ type: "int", nullable: true })
  campus_size?: number;

  @Column({ default: false })
  UGC_approved?: boolean;

  @Column({ type: "varchar", nullable: true })
  meta_desc: string;

  @Column({ default: false })
  is_university?: boolean;

  @Column({ type: "numeric", nullable: true, default: 0 })
  kapp_rating?: number;

  @Column({ type: "numeric", nullable: true })
  kapp_score?: number;

  @Column({ type: "int", nullable: true })
  primary_stream_id?: number;

  @Column({ type: "varchar", nullable: true })
  college_brochure: string;

  @Column({ type: "text", nullable: true })
  metadata?: string;

  // Email domains for auto-linking (e.g., ["@iitd.ac.in", "@iitdelhi.ac.in"])
  @Column({ type: "text", array: true, nullable: true })
  emailDomains?: string[];

  // @Column({ type: "varchar", nullable: true })
  // area?: string;

  @ManyToOne(() => Stream, (stream) => stream.collegeInfos, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "primary_stream_id" })
  primaryStream?: Stream;

  // One-to-Many relationship with CollegeContent
  @OneToMany(() => CollegeContent, (collegeContent) => collegeContent.college)
  collegeContents: CollegeContent[];

  @OneToMany(() => CollegeGallery, (collegeGallery) => collegeGallery.college)
  collegegGallerys: CollegeGallery[];

  @OneToMany(() => CollegeVideo, (collegeVideo) => collegeVideo.college)
  collegeVideos: CollegeVideo[];

  @OneToMany(() => CollegeWiseFees, (collegewisefee) => collegewisefee.college)
  collegewisefees: CollegeWiseFees[];

  @OneToMany(
    () => CollegeWisePlacement,
    (collegewisePlacement) => collegewisePlacement.college
  )
  collegewisePlacements: CollegeWisePlacement[];

  @OneToMany(
    () => CollegeScholarship,
    (collegeScholarship) => collegeScholarship.college
  )
  collegeScholarships: CollegeWisePlacement[];

  @OneToMany(
    () => CollegeHostelCampus,
    (collegeHostelCampus) => collegeHostelCampus.college
  )
  collegeHostelCampuss: CollegeHostelCampus[];

  @OneToMany(() => CollegeDates, (collegeDate) => collegeDate.college)
  collegeDates: CollegeDates[];

  @OneToMany(() => CollegeCutoff, (collegeCutoff) => collegeCutoff.college)
  collegeCutoffs: CollegeCutoff[];

  @OneToMany(() => CollegeRanking, (collegeRanking) => collegeRanking.college)
  collegeRankings: CollegeRanking[];

  @OneToMany(() => CollegeExam, (collegeExam) => collegeExam.college)
  collegeExams: CollegeExam[];

  @OneToMany(() => CollegeWiseCourse, (collegeCourse) => collegeCourse.college)
  collegeCourses: CollegeWiseCourse[];

  @OneToMany(() => Faculties, (facultie) => facultie.college)
  faculties: Faculties[];

  // Many-to-One relationship with Exam
  @ManyToOne(() => City, (city) => city.college_infos, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "city_id" })
  city: City;

  // Many-to-One relationship with Exam
  @ManyToOne(() => State, (state) => state.college_infos, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "state_id" })
  state: State;

  // Many-to-One relationship with Country
  @ManyToOne(() => Country, (country) => country.college_infos, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "country_id" })
  country: Country;

  @OneToMany(() => LeadForm, (leadForm) => leadForm.college)
  leadForms: LeadForm[];

  @OneToMany(() => Member, (member) => member.college)
  members: Member[];

  @OneToMany(() => Invitation, (invitation) => invitation.college)
  invitations: Invitation[];

  @OneToMany(() => FollowCollege, (follow) => follow.college)
  followers: FollowCollege[];
}
