import {
  BadRequestException,
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
import { RolesGuard } from "../../../cms/auth/utils/roles.guard";
import { Roles } from "../../../cms/auth/utils/roles.decorator";

import CmsCourseContentService from "./course-content.service";

import { CreateCourseContentCmsDto } from "../course-content/dto/create-course-content-cms.dto";

import { UpdateCourseContentCMSDto } from "../course-content/dto/update-course-content-cms.dto";
import { File, FileInterceptor } from "@nest-lab/fastify-multer";

@UseGuards(JwtCmsAuthGuard)
@Controller("/cms-course/content")


export default class CmsCourseContentController {
  constructor(
    private readonly cmsCourseContentService: CmsCourseContentService
  ) { }

  @Get("/:course_id")
  getCourseContentById(@Param("course_id") course_id: string) {
    const parseId = parseInt(course_id)

    console.log("Parsed Course ID:", parseId, "Original Type:", typeof parseId);

  if (isNaN(parseId)) {
    throw new BadRequestException("Invalid course ID format");
  }
    return this.cmsCourseContentService.getCourseContentById(parseId);
  }


  @Post("/create")
  @UseInterceptors(FileInterceptor("file"))
  createCollegeContent(
    @Body(ValidationPipe) createCollegeContent: CreateCourseContentCmsDto,
    @Req() req: any,
    @UploadedFile() file?: File
  ) {
    const user_id = req.user?.userId;
    return this.cmsCourseContentService.createCourseContent(
      createCollegeContent,
      user_id,
      file
    );
  }


  @Put("/:course_content_id")
  @UseInterceptors(FileInterceptor("file"))
  updateCourseContentById(
    @Body(ValidationPipe)
    updateCourseContentCMSDTO: UpdateCourseContentCMSDto,
    @Param("course_content_id") course_content_id: number,
    @Req() req: any,
    @UploadedFile() file?: File
  ) {
    const user_id = req.user?.userId;

    if (!user_id) {
      throw new Error("User ID is undefined");
    }

    return this.cmsCourseContentService.updateCourseContentById(
      course_content_id,
      updateCourseContentCMSDTO,
      user_id,
      file
    );
  }





}