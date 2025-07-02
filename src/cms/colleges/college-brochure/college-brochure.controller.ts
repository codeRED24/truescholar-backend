import { Body, Controller, Delete, Get, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { CollegeBrochureService } from "./college-brochure.service";
import { CreateCollegeBrochureDto } from "./dto/create-college-brochure.dto";
import { File, FileInterceptor } from "@nest-lab/fastify-multer";
import { UpdateCollegeBrochureDTO } from "./dto/update-college-brochure.dto";
import { JwtCmsAuthGuard } from "../../auth/jwt.cmsAuth.guard";


@UseGuards(JwtCmsAuthGuard)
@Controller("cms-college/collegebrochure")
export default class CollegeExamBrochureController {

    constructor(
        private readonly collegeBrochureService: CollegeBrochureService
    ) {}

    @Post("create")
    @UseInterceptors(FileInterceptor("file"))
    async createCollegeBrochure(
        @Body(ValidationPipe) create: CreateCollegeBrochureDto,
        @UploadedFile() file: File,
        @Req() req: any
    ) {

        const user_id = req.user?.userId;
        return this.collegeBrochureService.createCollegeBrochure(create,file, user_id);

    }

    @Put("update/:brochure_id")
    @UseInterceptors(FileInterceptor("file"))
    async updateCollegeBrochure(
        @Body(ValidationPipe) update: UpdateCollegeBrochureDTO,
        @Param("brochure_id") brochure_id: number,
        @UploadedFile() file: File,
        @Req() req: any
    ) {
        const user_id = req.user?.userId;
        return this.collegeBrochureService.updateCollegeBrochure(update,brochure_id, file, user_id);
    }
     

    @Delete("delete/:brochure_id")
    async deleteCollegeBrochure(
        @Param("brochure_id") brochure_id: number,
        @Req() req: any
    ) {
        const user_id = req.user?.userId;
        return this.collegeBrochureService.deleteCollegeBrochure(brochure_id, user_id);
    }

    @Get("get/:college_id")
    async getCollegeBrochue(
        @Param("college_id") college_id: number
    ) {
        return this.collegeBrochureService.getCollegeBrochure(college_id);
    }
  
   
}