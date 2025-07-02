import { Body, Controller, Param, Put, Req, UseGuards } from "@nestjs/common";
import { JwtCmsAuthGuard } from "../auth/jwt.cmsAuth.guard";
import BulkUploadSeoService from "./bulk-upload.service";

@UseGuards(JwtCmsAuthGuard)
@Controller("/cms/bulk-upload")
export class BulkUplaodSeoController {
  constructor(private readonly bulkUploadSeoService: BulkUploadSeoService) {}

  @Put("/seo/:type")
  async uploaadSeo(
    @Param("type") type: "exam" | "college",
    @Body() records: any[],
    @Req() req: any
  ) {
    const user_id = req.user.userId;
    return this.bulkUploadSeoService.bulkUpdateSeo(records, type, user_id);
  }

  @Put("/college/details")
  async uploadCollegeDetails(
    @Body() records: any[],
    @Req() req: any
  ) {
    const user_id = req.user.userId;
    return this.bulkUploadSeoService.bulkUpdateCollegeDetails(records, user_id);
  }

  @Put("/college/course")
  async uploadCollegewiseCourse(
    @Body() records: any[],
    @Req() req: any
  ) {
    const user_id = req.user.userId;
    return this.bulkUploadSeoService.bulkUpdateCollegewiseCourse(records, user_id);
  }
}
