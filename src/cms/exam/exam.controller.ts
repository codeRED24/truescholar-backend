import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { ExamService } from "./exam.service";
import { CreateExamCMSDto } from "./dto/create-exam.dto";
import { UpdateExamCMSDto } from "./dto/update-exam.dto";
import { ExamFilterDTO } from "./dto/exam-filter.dto";
import { JwtCmsAuthGuard } from "../auth/jwt.cmsAuth.guard";
import { UpdateExamByRoleDTO } from "./dto/update-exam-by-role.dto";
import { RolesGuard } from "../auth/utils/roles.guard";
import { Roles } from "../auth/utils/roles.decorator";
import { FileInterceptor, File } from "@nest-lab/fastify-multer";

@Controller("cms-exam")
@UseGuards(JwtCmsAuthGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get("get-exam")
  getAll() {
    return this.examService.getAllData();
  }

  @Get("/all")
  async getAllExams(@Query(ValidationPipe) query: ExamFilterDTO) {
    const {
      is_active,
      exam_name,
      mode_of_exam,
      exam_method,
      application_mode,
      stream_name,
      page = 1,
      limit = 10,
      exam_id,
    } = query;

    return this.examService.getAllExams(
      {
        is_active,
        exam_name,
        mode_of_exam,
        exam_method,
        application_mode,
        stream_name,
        exam_id,
      },
      page || 1,
      limit || 10
    );
  }

  @Post("create")
  @UseInterceptors(FileInterceptor("exam_logo"))
  async createExam(
    @Body(new ValidationPipe({ transform: true })) exam: CreateExamCMSDto,
    @Req() req: any,
    @UploadedFile() exam_logo: File
  ) {
    try {
      const user_id = req.user.userId;
      return this.examService.createExam(exam, user_id, exam_logo);
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(RolesGuard)
  @Roles("admin")
  @Put("update/:exam_id")
  @UseInterceptors(FileInterceptor("exam_logo"))
  async updateExam(
    @Body(ValidationPipe) updateExamCMSDTO: UpdateExamCMSDto,
    @Param("exam_id") exam_id: number,
    @Req() req: any,
    @UploadedFile() exam_logo: File
  ) {
    const user_id = req.user.userId;
    return this.examService.updateExam(
      exam_id,
      updateExamCMSDTO,
      user_id,
      exam_logo
    );
  }

  @UseGuards(RolesGuard)
  @Roles("admin")
  @Delete("delete/:exam_id")
  async deleteExam(@Param("exam_id") exam_id: number, @Req() req: any) {
    const user_id = req.user.userId;
    return this.examService.deleteExam(exam_id, user_id);
  }

  @Put("/:exam_id")
  async updateExamByRole(
    @Body() updateExamByRoleDTO: UpdateExamByRoleDTO,
    @Param("exam_id") exam_id: number,
    @Req() req: any
  ) {
    const user_id = req.user.userId;
    return this.examService.updateExamByRole(
      exam_id,
      updateExamByRoleDTO,
      user_id
    );
  }

  @Get("/search")
  async searchExam(
    @Query("exam_name") exam_name: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20
  ) {
    return this.examService.searchExam(exam_name, page || 1, limit || 20);
  }

  @Get("/search-course")
  async searchCourseGroups(
    @Query("course_name") course_name: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20
  ) {
    return this.examService.searchCourseGroups(
      course_name,
      page || 1,
      limit || 20
    );
  }
}
