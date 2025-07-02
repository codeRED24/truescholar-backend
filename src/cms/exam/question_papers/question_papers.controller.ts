import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from "@nestjs/common";
import { QuestionPaperService } from "./question_papers.service";
import { CreateQuestionPaperDto } from "./dto/createQuestionPaper.dto";
import { FileInterceptor } from "@nest-lab/fastify-multer";
import { JwtCmsAuthGuard } from "../../../cms/auth/jwt.cmsAuth.guard";
import { File } from "@nest-lab/fastify-multer";
import { UpdateQuestionPaperDto } from "./dto/updateQuestionPaper.dto";

@UseGuards(JwtCmsAuthGuard)
@Controller("/cms-exam/question-papers")
export class QuestionPaperController {
  constructor(private readonly questionPaperService: QuestionPaperService) {}

  @Post("/create")
  @UseInterceptors(FileInterceptor("file"))
  createQuestionPaper(
    @Body(ValidationPipe) createQuestionPaperDto: CreateQuestionPaperDto,
    @Req() req: any,
    @UploadedFile() file: File
  ) {
    const user_id = req.user.userId;
    return this.questionPaperService.createQuestionPaper(
      createQuestionPaperDto,
      user_id,
      file
    );
  }

  @Put("/:id")
  @UseInterceptors(FileInterceptor("file"))
  updateQuestionPaper(
    @Param("id") id: number,
    @Body(ValidationPipe) updateQuestionPaperDto: UpdateQuestionPaperDto,
    @Req() req: any,
    @UploadedFile() file: File
  ) {
    const user_id = req.user.userId;
    return this.questionPaperService.updateQuestionPaper(
      id,
      updateQuestionPaperDto,
      user_id,
      file
    );
  }

  @Delete("/:id")
  deleteQuestionPaper(@Param("id") id: number, @Req() req: any) {
    const user_id = req.user.userId;
    return this.questionPaperService.deleteQuestionPaper(id, user_id);
  }
}
