import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateQuestionPaperDto } from "./dto/createQuestionPaper.dto";
import { File } from "@nest-lab/fastify-multer";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { DataSource } from "typeorm";
import { tryCatchWrapper } from "../../../config/application.errorHandeler";
import { LogType, RequestType } from "../../../common/enums";
import { UpdateQuestionPaperDto } from "./dto/updateQuestionPaper.dto";

@Injectable()
export class QuestionPaperService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logService: LogsService,
    private readonly fileUploadService: FileUploadService
  ) {}

  createQuestionPaper(
    createQuestionPaperDto: CreateQuestionPaperDto,
    user_id: number,
    file?: File
  ) {
    return tryCatchWrapper(async () => {
      let fileUrl = null;

      // Upload file if provided
      if (file) {
        fileUrl = await this.fileUploadService.uploadFile(
          file,
          "exam/question-papers"
        );
      }

      // Destructure DTO
      const { exam_id, title, type, year, subject, shift } =
        createQuestionPaperDto;

      // Insert using raw SQL query
      await this.dataSource.query(
        `INSERT INTO exam_question_papers 
            (exam_id, title, type, year, subject, shift, file_url, created_at, updated_at) 
           VALUES 
            ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW());`,
        [exam_id, title, type, year, subject, shift, fileUrl]
      );

      // Logging the action
      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Question paper with exam id '${exam_id}' created successfully.`,
        1,
        RequestType.POST,
        exam_id,
        createQuestionPaperDto
      );

      return {
        success: true,
        message: "Successfully created new question paper.",
      };
    });
  }

  async updateQuestionPaper(
    id: number,
    updateQuestionPaperDto: UpdateQuestionPaperDto,
    user_id: number,
    file?: File
  ) {
    return tryCatchWrapper(async () => {
      const paper = await this.dataSource.query(
        "SELECT file_url from exam_question_papers where question_paper_id = $1;",
        [id]
      );

      if (!paper || !paper.length) {
        throw new BadRequestException("Invalid question paper id.");
      }

      let fileUrl = null;

      // Upload file if provided
      if (file) {
        fileUrl = await this.fileUploadService.uploadFile(
          file,
          "exam/question-papers"
        );

        // Delete the file if existing
        if (paper[0].file_url) {
          await this.fileUploadService.deleteFileByPath(paper[0].file_url);
        }
      }

      // Prepare dynamic update query
      const updateFields: string[] = [];
      const params: any[] = [];

      for (const [key, value] of Object.entries(updateQuestionPaperDto)) {
        if (value !== undefined && value !== null) {
          updateFields.push(`${key} = $${params.length + 1}`);
          params.push(value);
        }
      }

      if (fileUrl) {
        updateFields.push(`file_url = $${params.length + 1}`);
        params.push(fileUrl);
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      params.push(id);
      const sql = `UPDATE exam_question_papers SET ${updateFields.join(", ")} WHERE question_paper_id = $${params.length} RETURNING exam_id;`;

      const result = await this.dataSource.query(sql, params);

      // Logging the action
      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Question paper with exam id '${result[0][0].exam_id || updateQuestionPaperDto.exam_id}' updated successfully.`,
        1,
        RequestType.PUT,
        result[0][0].exam_id || updateQuestionPaperDto.exam_id,
        updateQuestionPaperDto
      );

      return {
        success: true,
        message: "Successfully updated question paper.",
      };
    });
  }

  async deleteQuestionPaper(id: number, user_id: number) {
    return tryCatchWrapper(async () => {
      const paper = await this.dataSource.query(
        "SELECT * from exam_question_papers where question_paper_id = $1;",
        [id]
      );

      if (!paper || !paper.length) {
        throw new BadRequestException("Invalid question paper id.");
      }

      // Delete the file if existing
      if (paper[0].file_url) {
        await this.fileUploadService.deleteFileByPath(paper[0].file_url);
      }

      const sql = `DELETE FROM exam_question_papers WHERE question_paper_id = $1`;
      await this.dataSource.query(sql, [id]);

      // Logging the action
      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Question paper with exam id '${paper[0].exam_id}' deleted successfully.`,
        1,
        RequestType.DELETE,
        paper[0].exam_id,
        paper[0]
      );

      return {
        success: true,
        message: "Successfully deleted question paper.",
      };
    });
  }
}
