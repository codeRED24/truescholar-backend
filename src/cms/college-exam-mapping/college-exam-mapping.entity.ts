
import { CollegeInfo } from "../../college/college-info/college-info.entity"
import { CourseGroup } from "../../courses_module/course-group/course_group.entity";
import { Exam } from "../../exams_module/exams/exams.entity";
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class CollegeExamMapping {

    @PrimaryGeneratedColumn("increment")
      id: number;
    
    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @CreateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @ManyToOne(() => CollegeInfo)
      @JoinColumn({ name: "college_id" })
      college_id: CollegeInfo;

    @ManyToOne(() => Exam)
      @JoinColumn({ name: "exam_id" })
      exam_id: Exam;

    @ManyToOne(() => CourseGroup)
      @JoinColumn({ name: "course_group_id" })
      course_group_id: CourseGroup;



}