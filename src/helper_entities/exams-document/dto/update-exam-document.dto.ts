import { PartialType } from "@nestjs/mapped-types";
import { CreateExamDocumentDto } from "./create-exam-document.dto";

export class UpdateExamDocumentDto extends PartialType(CreateExamDocumentDto) {}
