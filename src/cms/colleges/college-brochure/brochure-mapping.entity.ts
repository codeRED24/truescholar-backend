import { CourseGroupType } from "../../../common/enums";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CollegeBrochure } from "./college-brochure.entity";

@Entity({name: "brochure_mapping"})
export class BrochureMapping {

    @PrimaryGeneratedColumn("increment")
    id: number;

    @CreateDateColumn({ type: "timestamp" })
        created_at: Date;
        
    @CreateDateColumn({ type: "timestamp" })
        updated_at: Date;

    @Column({
        type: "enum",
        enum: CourseGroupType,
    })
    course_type: CourseGroupType;

    @Column("int")
    course_type_id: number;

    @ManyToOne(() => CollegeBrochure, {onDelete: "CASCADE"})
        @JoinColumn({name: "brochure_id"})
        brochure_id: CollegeBrochure;

}