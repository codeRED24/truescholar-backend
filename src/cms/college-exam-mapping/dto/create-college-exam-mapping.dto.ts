import { IsNumber } from "class-validator";

export class CollegeExamMappingDTO {

    @IsNumber()
    college_id: number;

    @IsNumber()
    exam_id: number[];

    @IsNumber()
    course_group_id: number;
}