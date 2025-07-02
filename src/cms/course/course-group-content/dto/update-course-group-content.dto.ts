import { PartialType } from "@nestjs/mapped-types";
import { createCourseGroupContentDto } from "./create-course-group-content.dto";

export class UpdateCourseGroupContentDto extends PartialType(createCourseGroupContentDto) {
  isContentChanged?: boolean;

}