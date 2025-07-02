import { PartialType } from "@nestjs/mapped-types";
import { CreateExamDateDto } from "./create-exam-dates.dto";

export class UpdateExamDateDto extends PartialType(CreateExamDateDto) {
}
