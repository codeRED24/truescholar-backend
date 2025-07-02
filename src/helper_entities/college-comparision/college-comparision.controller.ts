// college-comparision.controller.ts
import { Controller, Get, Param } from "@nestjs/common";
import { CollegeComparisionService } from "./college-comparision.service";
import { CollegeComparisonDto } from "./dto/college-comparision.dto";

@Controller("college-comparison")
export class CollegeComparisionController {
  constructor(
    private readonly collegeComparisionService: CollegeComparisionService
  ) {}

  @Get(":id")
  async getCollegeComparison(
    @Param("id") id: number
  ): Promise<CollegeComparisonDto> {
    return this.collegeComparisionService.getCollegeComparison(id);
  }
}
