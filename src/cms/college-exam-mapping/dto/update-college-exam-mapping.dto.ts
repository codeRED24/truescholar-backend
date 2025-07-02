import { PartialType } from "@nestjs/mapped-types";
import { CollegeExamMappingDTO } from "./create-college-exam-mapping.dto";

export class UpdateCollegeExamMappingDTO extends PartialType(CollegeExamMappingDTO) {}