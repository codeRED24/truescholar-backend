import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UpdateExamContentCMSDto } from "./dto/update-exam_content.dto";
import { ExamContent } from "../../../exams_module/exam-content/exam_content.entity";
import { tryCatchWrapper } from "../../../config/application.errorHandeler";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { LogType, RequestType } from "../../../common/enums";
import { CreateExamContentCMSDto } from "./dto/create-exam_content.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";
import { File } from "@nest-lab/fastify-multer";
import { Console } from "console";

@Injectable()
export class ExamContentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logService: LogsService,
    private readonly fileUploadService: FileUploadService,

    @InjectRepository(ExamContent)
    private readonly examContentRepository: Repository<ExamContent>
  ) {}

  async getExamContentById(exam_id: number) {
    return tryCatchWrapper(async () => {
      const examInfoQuery = `
              SELECT 
                e.*,
                st.stream_name
              FROM 
                exam e
              LEFT JOIN stream st ON e.stream_id = st.stream_id
              WHERE exam_id = $1;`;

      const examContentsQuery = `
              SELECT DISTINCT ON (ec.silos) 
                  ec.*, 
                  a.author_name
              FROM 
                  exam_content ec
              LEFT JOIN 
                  author a 
              ON 
                  ec.author_id = a.author_id
              WHERE 
                  ec.exam_id = $1 
              ORDER BY 
                  ec.silos, 
                  ec.updated_at DESC;
          `;

      const parentCutoffCategory = `
         SELECT DISTINCT(category) from college_cutoff where exam_id = $1;
      `;

      const examDates = `SELECT * FROM exam_date where exam_id = $1;`;

      const examQuestionPapers = `SELECT * FROM exam_question_papers where exam_id = $1`;

      const [
        examInfo,
        examContents,
        parent_cutoff_category,
        exam_dates,
        exam_question_papers,
      ] = await Promise.all([
        this.dataSource.query(examInfoQuery, [exam_id]),
        this.dataSource.query(examContentsQuery, [exam_id]),
        this.dataSource.query(parentCutoffCategory, [exam_id]),
        this.dataSource.query(examDates, [exam_id]),
        this.dataSource.query(examQuestionPapers, [exam_id]),
      ]);

      if (!examInfo?.length) {
        throw new NotFoundException("Exam content not found.");
      }

      // Getting parent exam id
      // let parent_exam_name;
      // if (examInfo[0].parent_exam_id) {
      //   const response = await this.dataSource.query(
      //     "SELECT exam_name from exam WHERE exam_id = $1;",
      //     [examInfo[0].parent_exam_id]
      //   );
      //   parent_exam_name = response[0].exam_name;
      // }

      return {
        success: true,
        message: "Successfully found exam contents.",
        data: {
          exam_info: {
            ...examInfo[0],
            // ...(parent_exam_name && { parent_exam_name }),
          },
          exam_contents: examContents,
          parent_cutoff_category,
          exam_dates,
          exam_question_papers,
        },
      };
    });
  }

  async updateExamContent(
    exam_content_id: number,
    updateExamContentDTO: UpdateExamContentCMSDto,
    user_id: number,
    og_featured_img: File
  ) {
    return tryCatchWrapper(async () => {
      let conditions: string[] = [];
      let params: (string | number | boolean)[] = [
        typeof exam_content_id === "number"
          ? exam_content_id
          : parseInt(exam_content_id),
      ];

      let index = 2;
      for (const [key, value] of Object.entries(updateExamContentDTO)) {
        if (
          value != null &&
          !["exam_content_id", "created_at", "isContentChanged"].includes(key)
        ) {
          conditions.push(`${key} = $${index}`);
          params.push(value);
          index++;
        }
      }

      if (conditions.length === 0) {
        throw new BadRequestException("No valid fields to update");
      }

      const examIdQuery = `
        SELECT exam_id 
        FROM exam_content 
        WHERE exam_content_id = $1;
      `;
      const examData = await this.dataSource.query(examIdQuery, [
        exam_content_id,
      ]);
      const exam_id = examData[0].exam_id;

      let ogImage: string | null = null;

      if (og_featured_img) {
        ogImage = await this.fileUploadService.uploadFile(
          og_featured_img,
          "exam/logo"
        );
        conditions.push(`og_featured_img = $${index}`);
        params.push(ogImage);
        index++;
      }

      const query = `
          UPDATE exam_content
          SET ${conditions.join(", ")}
          ${updateExamContentDTO.isContentChanged ? ", updated_at = NOW()" : ""}
          WHERE exam_content_id = $1;
        `;

      console.log("query", query);

      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Exam Content with ID ${exam_content_id} updated successfully`,
        1,
        RequestType.PUT,
        exam_id,
        { updateExamContentDTO, ...{ ogImage } }
      );

      const result = await this.dataSource.query(query, params);
      return {
        message: `Exam Content with ID ${exam_content_id} updated successfully`,
        data: result,
      };
    });
  }

  async createExamContent(
    createExamContent: CreateExamContentCMSDto,
    user_id: number,
    og_featured_img: File
  ) {
    return tryCatchWrapper(async () => {
      let ogImage = "";
      if (og_featured_img) {
        ogImage = await this.fileUploadService.uploadFile(
          og_featured_img,
          "exam/content"
        );
      }

      const examContent = this.examContentRepository.create({
        ...createExamContent,
        ...(ogImage && { og_featured_img: ogImage }),
      });
      const result = await this.examContentRepository.save(examContent);

      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Exam Content created successfully for exam ID ${result.exam_id}`,
        1,
        RequestType.POST,
        result.exam_id, // Make sure this refers to a valid exam_id
        { createExamContent, ...{ ogImage } }
      );

      // Optionally, return the newly created content as a response
      return {
        message: "Exam content created successfully",
        data: result,
      };
    });
  }
}
