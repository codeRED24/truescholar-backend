import { PartialType } from "@nestjs/mapped-types";
import { CreateCollegeBrochureDto } from "./create-college-brochure.dto";

export class UpdateCollegeBrochureDTO extends PartialType(CreateCollegeBrochureDto) {}