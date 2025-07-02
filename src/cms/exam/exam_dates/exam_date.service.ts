import { BadRequestException, Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UpdateExamDateDto } from "./dto/update-exam-dates.dto";
import { ExamDate } from "../../../exams_module/exam-dates/exam_dates.entity";
import { tryCatchWrapper } from "../../../config/application.errorHandeler";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { LogType, RequestType } from "../../../common/enums";
import { CreateExamDateDto } from "./dto/create-exam-dates.dto";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ExamDatesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logService: LogsService,

    @InjectRepository(ExamDate)
    private readonly examDateRepository: Repository<ExamDate>
  ) {}

  async createExamDate(createExamDate: CreateExamDateDto, user_id: number) {
    return tryCatchWrapper(async () => {
      if (createExamDate.event_type !== "Miscellaneous") {
        // Check for duplicate exam date
        const isDateExists = await this.dataSource.query(
          "SELECT * FROM exam_date WHERE exam_id = $1 AND event_type = $2 AND year = $3;",
          [createExamDate.exam_id, createExamDate.event_type , createExamDate.year]
        );

        if (isDateExists && isDateExists.length) {
          throw new BadRequestException(
            `Dates with event type '${createExamDate.event_type}' already exists for exam ${createExamDate.exam_id}.`
          );
        }
      }

      const examDate = this.examDateRepository.create(createExamDate);
      const result = await this.examDateRepository.save(examDate);

      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Exam Date created successfully for exam ID ${result.exam_id}`,
        1,
        RequestType.POST,
        result.exam_id, // Make sure this refers to a valid exam_id
        { createdFields: createExamDate }
      );

      return {
        success: true,
        message: "Exam date created successfully",
      };
    });
  }

  async updateExamDate(
    exam_date_id: number,
    updateExamDateDTO: UpdateExamDateDto,
    user_id: number
  ) {
    return tryCatchWrapper(async () => {
      let conditions: string[] = [];
      let params: (string | number | boolean)[] = [
        typeof exam_date_id === "number"
          ? exam_date_id
          : parseInt(exam_date_id),
      ];

      let index = 2;
      for (const [key, value] of Object.entries(updateExamDateDTO)) {
        if (
          value != null &&
          !["exam_date_id", "created_at", "updated_at"].includes(key)
        ) {
          conditions.push(`${key} = $${index}`);
          params.push(value);
          index++;
        }
      }

      if (conditions.length === 0) {
        throw new BadRequestException("No valid fields to update");
      }

      const query = `
          UPDATE exam_date
          SET ${conditions.join(", ")},
          updated_at = NOW()
          WHERE exam_date_id = $1
          RETURNING exam_id;
        `;

      const updatedDate = await this.dataSource.query(query, params);
      const examId = updatedDate[0][0]?.exam_id;

      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Exam Date with ID ${exam_date_id} updated successfully`,
        1,
        RequestType.PUT,
        examId,
        { updatedFields: updateExamDateDTO }
      );

      return {
        success: true,
        message: `Exam Date with ID ${exam_date_id} updated successfully`,
      };
    });
  }

  deleteExamDate(exam_date_id: number, user_id: number) {
    return tryCatchWrapper(async () => {
      const query = `
        DELETE FROM exam_date
        WHERE exam_date_id = $1
        RETURNING exam_id;
      `;
      const deleteDate = await this.dataSource.query(query, [exam_date_id]);
      const examId = deleteDate[0][0]?.exam_id;
      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Exam Date with ID ${exam_date_id} deleted successfully`,
        1,
        RequestType.DELETE,
        examId,
        {}
      );

      return {
        success: true,
        message: `Exam Date with ID ${exam_date_id} deleted successfully`,
      };
    });
  }
}
