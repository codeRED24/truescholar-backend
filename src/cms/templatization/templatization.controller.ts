import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { CmsTemplatizationService } from "./templatization.service";
import { JwtCmsAuthGuard } from "../auth/jwt.cmsAuth.guard";
import { RolesGuard } from "../auth/utils/roles.guard";
import { Roles } from "../auth/utils/roles.decorator";
import { UpdateTemplatizationDto } from "./dtos/UpdateTemplatization.dto";

@UseGuards(JwtCmsAuthGuard)
@Controller("/cms-templatization")
export class CmsTemplatizationController {
  constructor(
    private readonly cmsTemplatizationService: CmsTemplatizationService
  ) {}

  @UseGuards(RolesGuard)
  @Roles("admin")
  @Post("/college/:silos_name")
  createCollegeBulkTemplatization(
    @Param("silos_name") silos_name: string,
    @Req() req: any
  ) {
    const user_id = req.user?.userId;
    return this.cmsTemplatizationService.createCollegeBulkTemplatization(
      silos_name,
      user_id
    );
  }

  @Post("/college/:college_id/:silos_name")
  createCollegeTemplatization(
    @Param("college_id") college_id: string,
    @Param("silos_name") silos_name: string,
    @Req() req: any
  ) {
    const user_id = req.user?.userId;
    return this.cmsTemplatizationService.createCollegeTemplates(
      parseInt(college_id),
      silos_name,
      user_id
    );
  }

  @Put("/college/:templatization_id")
  updateCollegeTemplatization(
    @Param("templatization_id") templatization_id: string,
    @Body(ValidationPipe) data: UpdateTemplatizationDto,
    @Req() req: any
  ) {
    const user_id = req.user?.userId;
    return this.cmsTemplatizationService.updateCollegeTemplatization(
      parseInt(templatization_id),
      data,
      user_id
    );
  }
}
