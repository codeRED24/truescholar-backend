import { IsInt, IsOptional } from "class-validator";

export class CreateCollegeWiseCoursesDto {
  @IsInt()
  college_id: number;

  @IsInt()
  course_id: number;

  @IsInt()
  @IsOptional() 
  course_group_id?: number;

  @IsInt()
  @IsOptional()
  fees?: number;
}
