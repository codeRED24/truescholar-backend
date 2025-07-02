import { PartialType } from "@nestjs/mapped-types";
import { CreateListingContentDto } from "./create-listing-content.dto";

export class UpdateListingContentDto extends PartialType(
  CreateListingContentDto
) {}
