import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CollegeRole } from "../../common/enums";

export class UpdateRoleDto {
  @ApiProperty({ enum: CollegeRole, description: "New role for the member" })
  @IsEnum(CollegeRole)
  role: CollegeRole;
}
