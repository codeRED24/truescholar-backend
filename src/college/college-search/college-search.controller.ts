import { Controller, Get, Query } from "@nestjs/common";
import { CollegeSearchService } from "./college-search.service";

@Controller("college-search")
export class CollegeSearchController {
  constructor(private readonly collegeSearchService: CollegeSearchService) {}

  @Get()
  async search(@Query("q") query: string) {
    return this.collegeSearchService.searchColleges(query);
  }
}
