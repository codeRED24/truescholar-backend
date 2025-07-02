import { CollegeInfo } from "../../../college/college-info/college-info.entity";
import { CourseGroup } from "../../../courses_module/course-group/course_group.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: "course_group_content"})
export class CourseGroupContent {

    @PrimaryGeneratedColumn("increment")
    course_group_content_id: number;

    @CreateDateColumn({ type: "timestamp" })
      created_at: Date;
    
    @UpdateDateColumn({ type: "timestamp" })
      updated_at: Date;

    @Column({ type: "varchar", length: 300 })
      title: string;
    
    @Column({ type: "text", nullable: true })
      description?: string;

    @Column({ type: "int", nullable: true })
      author_id?: number;
    
    @Column({ default: false })
      is_active: boolean;
    
    @Column({ type: "varchar", length: 500, nullable: true })
      refrence_url?: string;
    
    @Column({ type: "varchar", nullable: true })
      meta_desc: string;

    @Column({ type: "text", nullable: true })
      seo_param?: string;

    @Column({ nullable: true, type: "varchar" })
      og_title?: string;
    
    @Column({ nullable: true, type: "varchar" })
      og_description?: string;
    
    @Column({ nullable: true, type: "varchar" })
      og_featured_img?: string;
    

    @ManyToOne(() => CourseGroup )
      @JoinColumn({ name: "course_group_id" })
      course_group_id: CourseGroup;

    @ManyToOne(() => CollegeInfo)
      @JoinColumn({ name: "college_id" })
      college_id: CollegeInfo;
}