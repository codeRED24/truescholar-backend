import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, IsArray, ArrayMinSize } from "class-validator";

export class CreateCollegeBrochureDto {
  @IsString()
  brochure_title: string;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  year: number;

  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  college_id: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => 
    Array.isArray(value) 
      ? value.map((v) => (isNaN(Number(v)) ? null : Number(v))).filter((v) => v !== null) 
      : isNaN(Number(value)) 
        ? [] 
        : [Number(value)]
  )
  course_group_id?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => 
    Array.isArray(value) 
      ? value.map((v) => (isNaN(Number(v)) ? null : Number(v))).filter((v) => v !== null) 
      : isNaN(Number(value)) 
        ? [] 
        : [Number(value)]
  )
  course_id?: number[];
}
