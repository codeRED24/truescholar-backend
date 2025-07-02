import { PartialType } from "@nestjs/mapped-types";
import { CreateCollegeContentCMSDto } from "./create-college-content-cms.dto";
import { IsOptional } from "class-validator";

export class UpdateCollegeContentCMSDto extends PartialType(
  CreateCollegeContentCMSDto
) {

  @IsOptional()
  isContentChanged?: boolean;
}
