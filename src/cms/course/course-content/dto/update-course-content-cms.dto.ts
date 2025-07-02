import { PartialType } from "@nestjs/mapped-types";
import { CreateCourseContentCmsDto } from "../dto/create-course-content-cms.dto";

export class UpdateCourseContentCMSDto extends PartialType(
    CreateCourseContentCmsDto
) {
  isContentChanged?: boolean;
}