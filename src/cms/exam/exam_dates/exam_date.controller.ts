import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ExamDatesService } from "./exam_date.service";
import { UpdateExamDateDto } from "./dto/update-exam-dates.dto";
import { JwtCmsAuthGuard } from "../../../cms/auth/jwt.cmsAuth.guard";
import { CreateExamDateDto } from "./dto/create-exam-dates.dto";

@UseGuards(JwtCmsAuthGuard)
@Controller("/cms-exam/dates")
export class ExamDatesController {
  constructor(private readonly examDatesService: ExamDatesService) {}

  @Post("/create")
  createExamDate(
    @Body(ValidationPipe) createExamDateDto: CreateExamDateDto,
    @Req() req: any
  ) {
    const user_id = req.user.userId;
    return this.examDatesService.createExamDate(createExamDateDto, user_id);
  }

  @Put("/:exam_date_id")
  UpdatebyId(
    @Body() updateExamDateDTO: UpdateExamDateDto,
    @Param("exam_date_id") exam_date_id: number,
    @Req() req: any
  ) {
    const user_id = req.user.userId;
    return this.examDatesService.updateExamDate(
      exam_date_id,
      updateExamDateDTO,
      user_id
    );
  }

  @Delete("/:exam_date_id")
  DeleteById(@Param("exam_date_id") exam_date_id: number, @Req() req: any) {
    const user_id = req.user.userId;
    return this.examDatesService.deleteExamDate(exam_date_id, user_id);
  }
}
