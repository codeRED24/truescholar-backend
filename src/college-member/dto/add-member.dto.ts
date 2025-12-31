import { IsEnum, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CollegeRole } from "../../common/enums";

export class AddMemberDto {
  @ApiProperty({ description: "User ID to add as member" })
  @IsString()
  userId: string;

  @ApiProperty({ enum: CollegeRole, description: "Role for the member" })
  @IsEnum(CollegeRole)
  role: CollegeRole;
}
