import { PartialType } from "@nestjs/mapped-types";
import { CreateCollegeInfoDto } from "./create-college-info.dto";

export class UpdateCollegeInfoDTO extends PartialType(
  CreateCollegeInfoDto
) {}
