import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import CMSCollegeExamMappingService from "./college-exam-mapping.service";
import { CollegeExamMappingDTO } from "./dto/create-college-exam-mapping.dto";
import { UpdateCollegeExamMappingDTO } from "./dto/update-college-exam-mapping.dto";
import { JwtCmsAuthGuard } from "../auth/jwt.cmsAuth.guard";

@UseGuards(JwtCmsAuthGuard)
@Controller('cms/college-exam-mapping')
export default class CMSCollegeExamMappingController {

    constructor(
        private readonly collegeExamService: CMSCollegeExamMappingService
    ) {}

    @Post('create')
    async createCollegeExamMapping(
        @Body(ValidationPipe) createcollegeExamDto: CollegeExamMappingDTO[],

    ) {
        return this.collegeExamService.createCollegeExamMapping(createcollegeExamDto);
    }

    @Put("update")
    async updateCollegeExamMapping(
        @Body(ValidationPipe) updatecollegeExamDto: UpdateCollegeExamMappingDTO[],
        @Req() req: any
    ) {
        const user_id = req.user?.userId;
        return this.collegeExamService.updateCollegeExamMapping(updatecollegeExamDto, user_id);
    }

    @Get('/all/:college_id')
    async getCollegeExam(
        @Param('college_id') college_id: number
    ) {
        return this.collegeExamService.getCollegeExam(college_id);
    }

}