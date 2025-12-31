import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CollegeRole } from "../../common/enums";

export class CreateLinkRequestDto {
  @ApiProperty({ enum: [CollegeRole.STUDENT, CollegeRole.ALUMNI] })
  @IsEnum(CollegeRole)
  role: CollegeRole;

  @ApiProperty({ required: false, description: "Year of enrollment" })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  enrollmentYear?: number;

  @ApiProperty({ required: false, description: "Year of graduation" })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  graduationYear?: number;
}
