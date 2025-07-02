import { PartialType } from "@nestjs/mapped-types";
import { CreateExamContentCMSDto } from "./create-exam_content.dto";

export class UpdateExamContentCMSDto extends PartialType(
  CreateExamContentCMSDto
) {
  isContentChanged?: boolean;
}
