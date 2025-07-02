import { Controller, Get, Query } from "@nestjs/common";
import { CmsAuthorsService } from "./cms-authors.service";

@Controller("cms-authors")
export class CmsAuthorsController {
  constructor(private readonly cmsAuthorsService: CmsAuthorsService) {}

  @Get("/get-all")
  findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("author_name") author_name: string
  ) {
    return this.cmsAuthorsService.findAll(page, limit, author_name);
  }
}
