import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from "@nestjs/common";
import CmsCollegeService from "./college.service";
import { CreateCollegeInfoDto } from "./dto/create-college-info.dto";
import { JwtCmsAuthGuard } from "../auth/jwt.cmsAuth.guard";
import { CollegeFilterDto } from "./dto/college-filter.dto";
import { Roles } from "../auth/utils/roles.decorator";
import { RolesGuard } from "../auth/utils/roles.guard";
import { AnyFilesInterceptor } from "@nest-lab/fastify-multer";
import { UpdateCollegeInfoDTO } from "./dto/update-college-info.dto";

@UseGuards(JwtCmsAuthGuard)
@Controller("cms-college")
export default class CmsCollegeController {
  constructor(private readonly cmsCollegeService: CmsCollegeService) {}

  @Post("create")
  @UseInterceptors(AnyFilesInterceptor())
  createCollege(
    @Body(new ValidationPipe({ transform: true }))
    college: CreateCollegeInfoDto,
    @Req() req: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const user_id = req.user?.userId;

    // Extract files by fieldname
    const logo_file = files.find((file) => file.fieldname === "logo_img");
    const banner_file = files.find((file) => file.fieldname === "banner_img");

    return this.cmsCollegeService.createCollege(
      college,
      user_id,
      logo_file,
      banner_file
    );
  }

  @Get("/all")
  getAllColleges(@Query(ValidationPipe) query: CollegeFilterDto) {
    const {
      college_name,
      college_id,
      is_online,
      is_university,
      girls_only,
      is_active,
      type_of_institute,
      city_name,
      state_name,
      page = 1,
      limit = 10,
    } = query;

    return this.cmsCollegeService.getAllColleges(
      {
        college_name,
        is_online,
        is_university,
        girls_only,
        is_active,
        type_of_institute,
        city_name,
        state_name,
        college_id,
      },
      page || 1,
      limit || 10
    );
  }

  @UseGuards(RolesGuard)
  @Roles("admin")
  @Put("/update/:college_id")
  @UseInterceptors(AnyFilesInterceptor())
  UpdateCollege(
    @Body(new ValidationPipe({ transform: true }))
    updateCollegeInfoDTO: UpdateCollegeInfoDTO,
    @Param("college_id") college_id: number,
    @Req() req: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const user_id = req.user?.userId;

    // Extract files by fieldname
    const logo_file = files.find((file) => file.fieldname === "logo_img");
    const banner_file = files.find((file) => file.fieldname === "banner_img");

    return this.cmsCollegeService.updateCollege(
      updateCollegeInfoDTO,
      college_id,
      user_id,
      logo_file,
      banner_file
    );
  }

  @Get("/search")
  async searchCollege(
    @Query("college_name") college_name: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20
  ) {
    return this.cmsCollegeService.searchCollege(
      college_name,
      page || 1,
      limit || 20
    );
  }

  @Get("/all/search")
  async getCollegeSearch(
    @Query("college_name") college_name: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20
  ) {
    return this.cmsCollegeService.getCollegeSearch(
      college_name,
      page || 1,
      limit || 20
    );
  }
}
