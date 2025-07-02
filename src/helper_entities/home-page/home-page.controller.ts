import { Controller, Get, Param } from "@nestjs/common";
import { HomePageService } from "./home-page.service";
import { HomePageResponseDto } from "./dto/home-page-response.dto";

@Controller("home-page")
export class HomePageController {
  constructor(private readonly homePageService: HomePageService) {}

  @Get()
  async getHomePageData(): Promise<HomePageResponseDto> {
    return this.homePageService.getHomePageData();
  }

  @Get("/header-footer")
  async getHeaderFooterData(): Promise<any> {
    return this.homePageService.getHeaderFooterData();
  }
  @Get("search")
  async getHomePageSearch(): Promise<any> {
    return this.homePageService.getHomePageSearch();
  }
  @Get("online-page")
  async getOnlinePage(): Promise<any> {
    return this.homePageService.getOnlinePage();
  }
  @Get("similar-colleges/:id")
  async getRecommendedColleges(@Param("id") id: number): Promise<any> {
    return this.homePageService.getRecommendedColleges(id);
  }
}
