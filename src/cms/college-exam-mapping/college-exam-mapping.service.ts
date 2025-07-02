import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CollegeExamMapping } from "./college-exam-mapping.entity";
import { InjectRepository } from "@nestjs/typeorm";

import { tryCatchWrapper } from "../../config/application.errorHandeler";
import { CollegeExamMappingDTO } from "./dto/create-college-exam-mapping.dto";
import { UpdateCollegeExamMappingDTO } from "./dto/update-college-exam-mapping.dto";
import { LogType, RequestType } from "../../common/enums";
import { LogsService } from "../cms-logs/logs.service";

@Injectable()
export default class CMSCollegeExamMappingService {
  constructor(
    @InjectRepository(CollegeExamMapping)
    private readonly collegeExamMappingRepository: Repository<CollegeExamMapping>,

    private readonly dataSource: DataSource,

    private readonly logService: LogsService
  ) {}

  async createCollegeExamMapping(createCollegeExamDto: CollegeExamMappingDTO[]) {
    return tryCatchWrapper(async () => {
      if (!Array.isArray(createCollegeExamDto) || createCollegeExamDto.length === 0) {
        throw new Error("Invalid request: Expected an array with at least one item.");
      }
  
      const collegeId = createCollegeExamDto[0].college_id; 
  
      // Check if the college exists
      const college = await this.dataSource.query(
        `SELECT college_id FROM college_info WHERE college_id = $1`,
        [collegeId]
      );
  
      if (!college.length) {
        throw new Error(`College with ID ${collegeId} not found.`);
      }
  
      const allMappings: any[] = [];
  
      for (const entry of createCollegeExamDto) {
        const { course_group_id, exam_id } = entry;
  
        // Check if course group exists
        const courseGroup = await this.dataSource.query(
          `SELECT course_group_id FROM course_group WHERE course_group_id = $1`,
          [course_group_id]
        );
  
        if (!courseGroup.length) {
          throw new Error(`Course group with ID ${course_group_id} not found.`);
        }
  
        for (const examId of exam_id) {
          // Check if exam exists
          const exam = await this.dataSource.query(
            `SELECT exam_id FROM exam WHERE exam_id = $1`,
            [examId]
          );
  
          if (!exam.length) {
            throw new Error(`Exam with ID ${examId} not found.`);
          }
  
          // Prepare mapping record
          allMappings.push({
            college_id: collegeId,
            course_group_id: course_group_id,
            exam_id: examId,
          });
        }
      }
  
      // Bulk insert all mappings
      if (allMappings.length > 0) {
        await this.collegeExamMappingRepository.insert(allMappings);
      }
  
      return {
        success: true,
        message: "Successfully added college exam mappings.",
        mappings: allMappings,
      };
    });
  }
  

  async updateCollegeExamMapping(
    updateDto: UpdateCollegeExamMappingDTO[],
    userId: number
  ) {
    return tryCatchWrapper(async () => {
      const collegeId = updateDto[0].college_id;

      const existingMappings = await this.dataSource.query(
        `SELECT exam_id, course_group_id FROM college_exam_mapping WHERE college_id = $1`,
        [collegeId]
      );

      const existingMap = new Map<number, number[]>();
      existingMappings.forEach((row) => {
        const groupId = row.course_group_id;
        if (!existingMap.has(groupId)) {
          existingMap.set(groupId, []);
        }
        existingMap.get(groupId)?.push(row.exam_id);
      });

      for (const data of updateDto) {
        const { college_id, course_group_id, exam_id } = data;
        const existingExamIds = existingMap.get(course_group_id) || [];

        const examsToAdd = exam_id.filter(
          (id) => !existingExamIds.includes(id)
        );
        const examsToRemove = existingExamIds.filter(
          (id) => !exam_id.includes(id)
        );

        if (examsToAdd.length > 0) {
          const values = examsToAdd
            .map((examId) => `(${college_id}, ${examId}, ${course_group_id})`)
            .join(",");

          await this.dataSource.query(
            `INSERT INTO college_exam_mapping (college_id, exam_id, course_group_id) VALUES ${values}`
          );
        }

        if (examsToRemove.length > 0) {
          await this.dataSource.query(
            `DELETE FROM college_exam_mapping 
                 WHERE college_id = $1 
                 AND course_group_id = $2 
                 AND exam_id IN (${examsToRemove.join(",")})`,
            [college_id, course_group_id]
          );
        }
      }

      await this.logService.createLog(
        userId,
        LogType.COLLEGE,
        `Updated College Exam Mapping for college ${collegeId}`,
        1,
        RequestType.PUT,
        collegeId,
        updateDto
      );

      return {
        success: true,
        message: "College exam mapping updated successfully",
      };
    });
  }

  async getCollegeExam(college_id: number) {
    return tryCatchWrapper(async () => {
      const query = `
          Select ce.course_group_id, cg.name, ce.exam_id, e.exam_name
          from course_group as cg 
          Left join college_exam_mapping as ce on cg.course_group_id = ce.course_group_id
          Left join exam as e on e.exam_id = ce.exam_id
          where ce.college_id = $1;
        `;

      const result = await this.dataSource.query(query, [college_id]);

      return {
        success: true,
        data: result,
      };
    });
  }
}