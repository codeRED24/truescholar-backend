import { PartialType } from "@nestjs/mapped-types";
import { CreateCmsAuthorDto } from "./create-cms-author.dto";

export class UpdateCmsAuthorDto extends PartialType(CreateCmsAuthorDto) {}
