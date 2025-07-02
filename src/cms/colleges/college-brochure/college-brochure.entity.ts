import { CollegeInfo } from "../../../college/college-info/college-info.entity";
import { CourseGroup } from "../../../courses_module/course-group/course_group.entity";
import { Course } from "../../../courses_module/courses/courses.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BrochureMapping } from "./brochure-mapping.entity";

@Entity({name: "college_brochure"})
export class CollegeBrochure {

    @PrimaryGeneratedColumn("increment")
    brochure_id: number;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;
    
    @CreateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @Column({ type: "varchar", nullable: false})
    brochure_title: string;

    @Column({ type: "varchar", nullable: false})
    brochure_file: string;

    @Column({ type: "int", nullable: false})
    year: number;

    @ManyToOne(() => CollegeInfo)
        @JoinColumn({ name: "college_id" })
        college_id: CollegeInfo;

    @OneToMany(() => BrochureMapping, (mapping) => mapping.brochure_id, { cascade: true })
        mappings_id: BrochureMapping[];

}