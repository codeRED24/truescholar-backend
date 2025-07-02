import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from "@nestjs/common";
import { JwtCmsAuthGuard } from "../../../cms/auth/jwt.cmsAuth.guard";
import CmsCollegeContentService from "./college-content.service";
import { UpdateCollegeContentCMSDto } from "./dto/update-college-content-cms.dto";
import { RolesGuard } from "../../../cms/auth/utils/roles.guard";
import { Roles } from "../../../cms/auth/utils/roles.decorator";
import { CreateCollegeContentCMSDto } from "./dto/create-college-content-cms.dto";
import { File, FileInterceptor } from "@nest-lab/fastify-multer";

@UseGuards(JwtCmsAuthGuard)
@Controller("/cms-college/content")
export default class CmsCollegeContentController {
  constructor(
    private readonly cmsCollegeContentService: CmsCollegeContentService
  ) {}

  @Get("/:college_id")
  getCollegeContentById(@Param("college_id") college_id: string) {
    const parsedId = parseInt(college_id);
    return this.cmsCollegeContentService.getCollegeContentById(parsedId);
  }

  @Post("/create")
  @UseInterceptors(FileInterceptor("og_featured_img"))
  createCollegeContent(
    @Body(new ValidationPipe({ transform: true })) createCollegeContent: CreateCollegeContentCMSDto,
    @Req() req: any,
    @UploadedFile() og_featured_img?: File,
  ) {
    const user_id = req.user?.userId;
    return this.cmsCollegeContentService.createCollegeContent(
      createCollegeContent,
      user_id,
      og_featured_img
    );
  }

  @Put("/:college_content_id")
  @UseInterceptors(FileInterceptor("og_featured_img"))
  updateCollegeContentById(
    @Body(ValidationPipe)
    updateCollegeContentCMSDTO: UpdateCollegeContentCMSDto,
    @Param("college_content_id") college_content_id: number,
    @Req() req: any,
    @UploadedFile() og_featured_img?: File,
  ) {
    const user_id = req.user?.userId;

    if (!user_id) {
      throw new Error("User ID is undefined");
    }

    return this.cmsCollegeContentService.updateCollegeContentById(
      college_content_id,
      updateCollegeContentCMSDTO,
      user_id,
      og_featured_img
    );
  }

  @UseGuards(RolesGuard)
  @Roles("admin")
  @Delete("/:college_content_id")
  deleteCollegeContent(
    @Param("college_content_id") college_content_id: number,
    @Req() req: any
  ) {
    const user_id = req.user?.userId;
    return this.cmsCollegeContentService.deleteCollegeContent(
      college_content_id,
      user_id
    );
  }
}
