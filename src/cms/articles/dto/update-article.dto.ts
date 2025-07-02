import { PartialType } from "@nestjs/mapped-types";
import { CreateArticleCMSDto } from "./create-article.dto";

export class UpdateArticleCMSDto extends PartialType(CreateArticleCMSDto) {}
