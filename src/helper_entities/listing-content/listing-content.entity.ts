import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { City } from "../cities/city.entity";
  import { State } from "../state/state.entity";
import { Stream } from "../stream/stream.entity";
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
  
  @Entity('listing_content')
  export class ListingContent {
    @PrimaryGeneratedColumn("increment")
    listing_content_id: number;

 
    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;
  
    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

  
    @Column({ type: "varchar", length: 300, nullable: true })
    title: string;
  
    @Column({ type: "varchar", length: 500, nullable: true })
    meta_desc: string;
  
    @Column({ type: "json", nullable: true })
    seo_param: string;
  
    @Column({ type: "text", nullable: true })
    description: string;
  
    @Column({ type: "boolean", default: true })
    is_active: boolean;
  
    @ManyToOne(() => City, (city) => city.listingContents, {
      nullable: true,
      onDelete: "SET NULL",
    })
    @JoinColumn({ name: "city_id" })
    city: City;
  
    @ManyToOne(() => State, (state) => state.listingContents, {
      nullable: true,
      onDelete: "SET NULL",
    })
    @JoinColumn({ name: "state_id" })
    state: State;
  
    @ManyToOne(() => Stream, (stream) => stream.listingContents, {
      nullable: true,
      onDelete: "SET NULL",
    })
    @JoinColumn({ name: "stream_id" })
    stream: Stream;
  
    @ManyToOne(() => CourseGroup, (courseGroup) => courseGroup.listingContents, {
      nullable: true,
      onDelete: "SET NULL",
    })
    @JoinColumn({ name: "course_group_id" })
    courseGroup: CourseGroup;

  }
  