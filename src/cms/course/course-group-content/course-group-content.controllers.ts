import { Body, Controller, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { CourseGroupContentService } from "./course-group-content.service";
import { createCourseGroupContentDto } from "./dto/create-course-group-content.dto";
import { File, FileInterceptor } from "@nest-lab/fastify-multer";
import { JwtCmsAuthGuard } from "../../auth/jwt.cmsAuth.guard";
import { UpdateCourseGroupContentDto } from "./dto/update-course-group-content.dto";


@UseGuards(JwtCmsAuthGuard)
@Controller('cms/course_group_content')
export class CourseGroupContentController {
    constructor(
        private readonly courseGroupContentService: CourseGroupContentService
    ) {}

    @Post("create")
    @UseInterceptors(FileInterceptor("og_featured_img"))
    async createCourseGroupContent(
        @Body() create: createCourseGroupContentDto,
        @UploadedFile() og_featured_img: File,
        @Req() req: any

    ) {
        const user_id = req.user?.userId;
        return this.courseGroupContentService.createCourseGroupContent(create, og_featured_img, user_id);
    }

    @Put("update/:course_group_id")
    @UseInterceptors(FileInterceptor("og_featured_img"))
    async updateCourseGroupContent(
        @Body(ValidationPipe) update: UpdateCourseGroupContentDto,
        @Param("course_group_id") course_group_id: number,
        @UploadedFile() og_featured_img: File,
        @Req() req: any
    ) {
        const user_id = req.user?.userId;
        return this.courseGroupContentService.updateCourseGroupContent(update,course_group_id, og_featured_img, user_id);
    }

    @Get("get/:course_group_id")
    async getCourseGroupContent(
        @Param("course_group_id") course_group_id: number
    ) {
        return this.courseGroupContentService.getCourseGroupContent(course_group_id);
    }

    @Get("get/content/:college_id")
    async getCourseGroupContentByCollege(
        @Param("college_id") college_id: number,
        @Query("page") page: number = 1,
        @Query("limit") limit: number = 10
    ) {
        return this.courseGroupContentService.getCourseGroupContentByCollege(college_id, page, limit);
    }

    @Get("get/all")
    async getAllCourseGroupContent(
        @Query("course_group_name") course_group_name?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.courseGroupContentService.getAllCourseGroupContent(course_group_name, page, limit);
    }
    
}