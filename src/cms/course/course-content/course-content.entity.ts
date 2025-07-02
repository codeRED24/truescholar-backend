import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    Index,
    JoinColumn,
} from "typeorm";
import { Course } from "../../../courses_module/courses/courses.entity";


@Entity()
export class CourseContent {

    @PrimaryGeneratedColumn()
    course_content_id: number;

    @Column({ type: "int", nullable: true })
    course_id?: number;

    @Column({ type: "varchar", length: 50, nullable: true })
    silos?: string;

    @Column({ default: false })
    is_active: boolean;


    @Column({ type: "varchar", length: 300 })
    title: string;

    @Column({ type: "text", nullable: true })
    description?: string;


    @Column({ type: "varchar", nullable: true })
    meta_desc: string;


    @Column({ type: "int", nullable: true })
    author_id?: number;


    @Column({ type: "varchar", length: 500, nullable: true })
    refrence_url?: string;


    @Column({ type: "varchar", nullable: true })
    img1_url: string;


    @Column({ type: "text", nullable: true })
    seo_param?: string;

    @Column({ type: "varchar", nullable: true})
    og_title?: string;

    @Column({ type: "varchar", nullable: true})
    og_description?: string;

    @Column({ type: "varchar", nullable: true})
    og_featured_img?: string;


    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @ManyToOne(() => Course, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "course_id" })
    course: Course;
}

