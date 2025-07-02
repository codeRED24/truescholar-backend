import { PartialType } from "@nestjs/mapped-types";
import { CreateExamCMSDto } from "./create-exam.dto";

export class UpdateExamCMSDto extends PartialType(CreateExamCMSDto) {}
