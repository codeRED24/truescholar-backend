import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CreateExamCMSDto } from "./dto/create-exam.dto";
import { UpdateExamCMSDto } from "./dto/update-exam.dto";
import { Exam } from "../../exams_module/exams/exams.entity";
import { ExamFilterDTO } from "./dto/exam-filter.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UpdateExamByRoleDTO } from "./dto/update-exam-by-role.dto";
import { tryCatchWrapper } from "../../config/application.errorHandeler";
import { LogsService } from "../cms-logs/logs.service";
import { LogType, RequestType } from "../../common/enums";
import { File } from "@nest-lab/fastify-multer";
import { FileUploadService } from "../../utils/file-upload/fileUpload.service";

@Injectable()
export class ExamService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logService: LogsService,
    private readonly fileUploadService: FileUploadService,

    @InjectRepository(Exam)
    private readonly examInfoRepository: Repository<Exam>
  ) {}

  async getAllData() {
    try {
      const query = await this.dataSource.query(`Select * from exam;`);

      return query;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllExams(filter: ExamFilterDTO, page?: number, limit?: number) {
    return tryCatchWrapper(async () => {
      const {
        is_active,
        exam_name,
        mode_of_exam,
        application_mode,
        stream_name,
        exam_id,
      } = filter;

      let conditions: string[] = [];
      let params: any[] = [];

      // Add conditions dynamically
      if (is_active !== undefined) {
        conditions.push(`e.is_active = $${params.length + 1}`);
        params.push(is_active);
      }

      if (exam_id) {
        conditions.push(`e.exam_id = $${params.length + 1}`);
        params.push(exam_id);
      }

      if (exam_name) {
        conditions.push(
          `(e.exam_name ILIKE $${params.length + 1} OR e.exam_shortname ILIKE $${params.length + 1})`
        );
        params.push(`%${exam_name}%`);
      }

      if (mode_of_exam) {
        const modes = mode_of_exam.split(",").map((m) => m.trim());
        conditions.push(`e.mode_of_exam = ANY($${params.length + 1})`);
        params.push(modes);
      }

      if (application_mode) {
        const modes = application_mode.split(",").map((m) => m.trim());
        conditions.push(`e.application_mode = ANY($${params.length + 1})`);
        params.push(modes);
      }

      if (stream_name) {
        conditions.push(`s.stream_name ILIKE $${params.length + 1}`);
        params.push(`%${stream_name}%`);
      }

      // Construct the WHERE clause
      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      // Add limit and offset
      if (page && limit) {
        const offset = (page - 1) * limit;
        params.push(limit, offset);
      }

      const query = `
        SELECT 
          e.exam_id,
          e.exam_name,
          e.exam_duration,
          s.stream_name
        FROM exam AS e
        LEFT JOIN stream AS s ON e.stream_id = s.stream_id
        ${whereClause}
        ORDER BY e.exam_date DESC
        LIMIT $${params.length - 1} OFFSET $${params.length};
      `;

      const countQuery = `
        SELECT COUNT(*) AS count
        FROM exam AS e
        LEFT JOIN stream AS s ON e.stream_id = s.stream_id
        ${whereClause};
      `;

      try {
        const [examsResult, countResult] = await Promise.all([
          this.dataSource.query(query, params),
          this.dataSource.query(countQuery, params.slice(0, params.length - 2)),
        ]);

        const totalExams = parseInt(countResult[0]?.count || "0", 10);

        return {
          success: true,
          message: "Data fetched successfully",
          data: examsResult,
          total: totalExams,
        };
      } catch (error) {
        throw new BadGatewayException("Error fetching exams: " + error.message);
      }
    });
  }

  async createExam(
    createExamCMSDto: CreateExamCMSDto,
    user_id: number,
    exam_logo?: File
  ) {
    return tryCatchWrapper(async () => {
      if (!createExamCMSDto) {
        await this.logService.createLog(
          user_id,
          LogType.EXAMS,
          "Request body is missing or invalid.",
          3,
          RequestType.POST,
          null,
          {}
        );
        throw new BadRequestException("Request body is missing or invalid.");
      }

      let logoUrl = "";
      if (exam_logo) {
        logoUrl = await this.fileUploadService.uploadFile(
          exam_logo,
          "exam/logo"
        );
      }

      const create = this.examInfoRepository.create({
        ...createExamCMSDto,
        is_active: "false",
        ...(logoUrl && { exam_logo: logoUrl }),
      });

      let result = await this.examInfoRepository.save(create);

      if (result.slug && !result.slug.includes(`-${result.exam_id}`)) {
        result.slug = result.slug.replace("-undefined", "");
        result.slug = `${result.slug}-${result.exam_id}`;
        result = await this.examInfoRepository.save(result);
      }

      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Exam with ID ${result.exam_id} created successfully.`,
        1,
        RequestType.POST,
        result.exam_id,
        createExamCMSDto
      );

      return {
        success: true,
        message: "Exam created successfully",
        exam_id: result.exam_id,
      };
    });
  }

  async updateExam(
    exam_id: number,
    updateExamCMSDto: UpdateExamCMSDto,
    user_id: number,
    exam_logo?: File
  ) {
    return tryCatchWrapper(async () => {
      if (!updateExamCMSDto) {
        throw new BadRequestException("Please provide fields to update");
      }

      // Check for active info silos
      if (updateExamCMSDto.is_active === "true") {
        const infoArticle = await this.dataSource.query(
          "SELECT silos from exam_content WHERE exam_id = $1 AND silos = $2 AND is_active = $3;",
          [exam_id, "info", "true"]
        );
        console.log(infoArticle);
        if (!infoArticle?.length) {
          throw new BadRequestException(
            "To activate the exam, an active info article is mandatory."
          );
        }
      }

      const fields = [];
      const values: any[] = [exam_id];

      if (updateExamCMSDto.slug) {
        const existingSlug = await this.dataSource.query(
          `SELECT 1 FROM exam WHERE slug = $1 AND exam_id != $2 LIMIT 1`,
          [updateExamCMSDto.slug, exam_id]
        );

        if (existingSlug.length > 0) {
          await this.logService.createLog(
            user_id,
            LogType.EXAMS,
            `Attempted to update exam with duplicate slug: ${updateExamCMSDto.slug}`,
            2,
            RequestType.PUT,
            exam_id,
            { attemptedSlug: updateExamCMSDto.slug }
          );
          throw new BadRequestException(
            `Slug ${updateExamCMSDto.slug} already exists.`
          );
        }
      }

      const existingExam = await this.dataSource.query(
        "SELECT * FROM exam WHERE exam_id = $1",
        [exam_id]
      );

      if (existingExam.length === 0) {
        await this.logService.createLog(
          user_id,
          LogType.EXAMS,
          `Failed to find exam with ID ${exam_id} for update`,
          3,
          RequestType.PUT,
          exam_id,
          {}
        );
        throw new Error(`Exam with ID ${exam_id} not found`);
      }

      let index = 2;
      for (const [key, value] of Object.entries(updateExamCMSDto)) {
        if (value != null) {
          if (["Application_process", "IsPublished"].includes(key)) {
            fields.push(`"${key}" = $${index}`);
          } else {
            fields.push(`${key} = $${index}`);
          }
          values.push(value);
          index++;
        }
      }

      if (exam_logo) {
        const logoUrl = await this.fileUploadService.uploadFile(
          exam_logo,
          "exam/logo"
        );
        if (logoUrl) {
          fields.push(`exam_logo = $${index}`);
          values.push(logoUrl);
          index++;
        }
      }

      if (existingExam.length === 0) {
        await this.logService.createLog(
          user_id,
          LogType.EXAMS,
          `Failed to find exam with ID ${exam_id} for update`,
          3,
          RequestType.PUT,
          exam_id,
          {}
        );
        throw new Error(`Exam with ID ${exam_id} not found`);
      }

      const query = `
        Update exam 
        SET ${fields.join(", ")},
        updated_at = NOW()
        WHERE exam_id = $1;
      `;

      await this.dataSource.query(query, values);

      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Exam with ID ${exam_id} updated successfully`,
        1,
        RequestType.PUT,
        exam_id,
        updateExamCMSDto
      );

      return {
        success: true,
        message: `Exam with ID ${exam_id} updated successfully`,
      };
    });
  }

  async deleteExam(exam_id: number, user_id: number) {
    return tryCatchWrapper(async () => {
      const existingExam = await this.dataSource.query(
        "SELECT * FROM exam WHERE exam_id = $1",
        [exam_id]
      );

      if (existingExam.length === 0) {
        await this.logService.createLog(
          user_id,
          LogType.EXAMS,
          `Failed to find exam with ID ${exam_id} for deletion`,
          3,
          RequestType.DELETE,
          exam_id,
          {}
        );
        throw new Error(`Exam with ID ${exam_id} not found`);
      }

      const query = `
        DELETE FROM exam WHERE exam_id = $1;
      `;

      const result = await this.dataSource.query(query, [exam_id]);

      if (result.affected === 0) {
        const log = await this.logService.createLog(
          user_id,
          LogType.EXAMS,
          `Failed to delete exam with ID ${exam_id}`,
          3,
          RequestType.DELETE,
          exam_id,
          {}
        );
        throw new NotFoundException(`Exam with ID ${exam_id} not found`);
      }

      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Exam with ID ${exam_id} deleted successfully`,
        1,
        RequestType.DELETE,
        exam_id,
        {}
      );
      return {
        message: `Exam with ID ${exam_id} deleted successfully`,
      };
    });
  }

  async updateExamByRole(
    exam_id: number,
    updateExamByRoleDTO: UpdateExamByRoleDTO,
    user_id: number
  ) {
    return tryCatchWrapper(async () => {
      const conditions: string[] = [];
      const params: (string | number | boolean)[] = [exam_id];

      const examInfo = `
      Select exam_id from exam
      where exam_id = $1
    `;

      if (!examInfo) {
        await this.logService.createLog(
          user_id,
          LogType.EXAMS,
          `Failed to find Exam with ID ${exam_id}`,
          3,
          RequestType.PUT,
          exam_id,
          {}
        );
        throw new NotFoundException(`Exam with ID ${exam_id} not found`);
      }

      let index = 2;
      for (const [key, value] of Object.entries(updateExamByRoleDTO)) {
        if (value !== null) {
          conditions.push(`${key} = $${index}`);
          params.push(value);
          index++;
        }
      }

      if (conditions.length === 0) {
        await this.logService.createLog(
          user_id,
          LogType.EXAMS,
          `No valid fields to update for Exam with ID ${exam_id}`,
          3,
          RequestType.PUT,
          exam_id,
          {}
        );
        throw new BadGatewayException("No valid fields to update");
      }

      const query = `
      Update Exam
      SET ${conditions.join(", ")}
      WHERE exam_id = $1;
    `;

      await this.logService.createLog(
        user_id,
        LogType.EXAMS,
        `Exam with ID ${exam_id} updated successfully`,
        1,
        RequestType.PUT,
        exam_id,
        updateExamByRoleDTO
      );

      const updatedExamInfo = await this.dataSource.query(query, params);
      return {
        message: `Exam with ID ${exam_id} updated successfully`,
        result: updatedExamInfo,
      };
    });
  }

  async searchExam(exam_name: string, page?: number, limit?: number) {
    return tryCatchWrapper(async () => {
      const params: any[] = [];
      if (exam_name) params.push(`%${exam_name}%`);
      let paginationClause = "";

      // Add LIMIT and OFFSET only if page and limit are provided
      if (page && limit) {
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        paginationClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;
      }

      // Main query
      const query = `
        SELECT exam_name, exam_id 
        FROM exam
        ${exam_name ? "WHERE exam_name ILIKE $1 OR exam_shortname ILIKE $1" : ""}
        ${paginationClause};
      `;

      const result = await this.dataSource.query(query, params);

      return {
        success: true,
        message: "Data fetched successfully",
        data: result,
      };
    });
  }

  async searchCourseGroups(course_name: string, page?: number, limit?: number) {
    return tryCatchWrapper(async () => {
      const params: any[] = [];
      if (course_name) params.push(`%${course_name}%`);
      let paginationClause = "";

      // Add LIMIT and OFFSET only if page and limit are provided
      if (page && limit) {
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        paginationClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;
      }

      // Main query
      const query = `
        SELECT course_group_id, full_name
        FROM course_group
        ${course_name ? "WHERE name ILIKE $1 OR full_name ILIKE $1" : ""}
        ${paginationClause};
      `;

      const result = await this.dataSource.query(query, params);

      return {
        success: true,
        message: "Data fetched successfully",
        data: result,
      };
    });
  }
}
