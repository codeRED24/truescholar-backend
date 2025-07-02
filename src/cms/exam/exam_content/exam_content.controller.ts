import {
  Body,
  Controller,
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
import { ExamContentService } from "./exam_content.service";
import { UpdateExamContentCMSDto } from "./dto/update-exam_content.dto";
import { JwtCmsAuthGuard } from "../../../cms/auth/jwt.cmsAuth.guard";
import { CreateExamContentCMSDto } from "./dto/create-exam_content.dto";
import { File, FileInterceptor } from "@nest-lab/fastify-multer";

@UseGuards(JwtCmsAuthGuard)
@Controller("/cms-exam/content")
export class ExamContentController {
  constructor(private readonly examContentService: ExamContentService) {}

  @Get("/:exam_id")
  findbyId(@Param("exam_id") exam_id: number) {
    return this.examContentService.getExamContentById(exam_id);
  }

  @Put("/:exam_content_id")
  @UseInterceptors(FileInterceptor("og_featured_img"))
  UpdatebyId(
    @Body() updateExamContentDTO: UpdateExamContentCMSDto,
    @Param("exam_content_id") exam_content_id: number,
    @Req() req: any,
    @UploadedFile() og_featured_img?: File,
  ) {
    const user_id = req.user.userId;
    return this.examContentService.updateExamContent(
      exam_content_id,
      updateExamContentDTO,
      user_id,
      og_featured_img
    );
  }

  @Post("/create")
  @UseInterceptors(FileInterceptor("og_featured_img"))
  createExamContent(
    @Body(new ValidationPipe({ transform: true })) createExamContentDTO: CreateExamContentCMSDto,
    @Req() req: any,
    @UploadedFile() og_featured_img?: File,
  ) {

    try {
      const user_id = req.user.userId;
      return this.examContentService.createExamContent(
        createExamContentDTO,
        user_id,
        og_featured_img
      );
    } catch (error) {
      console.log(error);
    }
  }
}
