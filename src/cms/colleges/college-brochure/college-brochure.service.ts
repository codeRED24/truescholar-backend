import { BadRequestException, Injectable } from "@nestjs/common";
import { CollegeBrochure } from "./college-brochure.entity";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCollegeBrochureDto } from "./dto/create-college-brochure.dto";
import { File } from "@nest-lab/fastify-multer";
import { tryCatchWrapper } from "../../../config/application.errorHandeler";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";
import { CollegeInfo } from "../../../college/college-info/college-info.entity";
import { Course } from "../../../courses_module/courses/courses.entity";
import { CourseGroup } from "../../../courses_module/course-group/course_group.entity";
import { UpdateCollegeBrochureDTO } from "./dto/update-college-brochure.dto";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { CourseGroupType, LogType, RequestType } from "../../../common/enums";
import { BrochureMapping } from "./brochure-mapping.entity";


@Injectable()
export class CollegeBrochureService {
  constructor(
    @InjectRepository(CollegeBrochure)
    private readonly collegeBrochureRepository: Repository<CollegeBrochure>,

    private readonly dataSource: DataSource,

    private readonly uploadService: FileUploadService,

    private readonly logService: LogsService
  ) {}

  async createCollegeBrochure(
    create: CreateCollegeBrochureDto,
    file: File,
    userId: number
  ) {
    return tryCatchWrapper(async () => {
      let brochure_file = "";
      if (file) {
        brochure_file = await this.uploadService.uploadFile(
          file,
          `college/brochure/${create.college_id}-${new Date().toISOString()}`
        );
      }

      const collegeId = Number(create.college_id);
      const courseIds = create.course_id
        ? Array.isArray(create.course_id)
          ? create.course_id.map(Number).filter((id) => !isNaN(id))
          : typeof create.course_id === "string"
            ? !isNaN(Number(create.course_id))
              ? [Number(create.course_id)] // ✅ Handles single string number like "1"
              : (() => {
                  try {
                    const parsed = JSON.parse(create.course_id);
                    return Array.isArray(parsed)
                      ? parsed.map(Number).filter((id) => !isNaN(id))
                      : [];
                  } catch (error) {
                    return [];
                  }
                })()
            : !isNaN(Number(create.course_id))
              ? [Number(create.course_id)]
              : []
        : [];

      const courseGroupIds = create.course_group_id
        ? Array.isArray(create.course_group_id)
          ? create.course_group_id.map(Number).filter((id) => !isNaN(id))
          : typeof create.course_group_id === "string"
            ? !isNaN(Number(create.course_group_id))
              ? [Number(create.course_group_id)] // ✅ Handles single string number like "1"
              : (() => {
                  try {
                    const parsed = JSON.parse(create.course_group_id);
                    return Array.isArray(parsed)
                      ? parsed.map(Number).filter((id) => !isNaN(id))
                      : [];
                  } catch (error) {
                    return [];
                  }
                })()
            : !isNaN(Number(create.course_group_id))
              ? [Number(create.course_group_id)]
              : []
        : [];

      const [college, courses, courseGroups] = await Promise.all([
        this.dataSource.query(
          "SELECT college_id FROM college_info WHERE college_id = $1",
          [collegeId]
        ),
        courseIds.length
          ? this.dataSource.query(
              "SELECT course_id FROM courses WHERE course_id = ANY($1)",
              [courseIds]
            )
          : [],
        courseGroupIds.length
          ? this.dataSource.query(
              "SELECT course_group_id FROM course_group WHERE course_group_id = ANY($1)",
              [courseGroupIds]
            )
          : [],
      ]);

      if (!college.length)
        throw new BadRequestException("Invalid college_id: College not found.");

      const existingCourseIds = new Set(courses.map((c) => c.course_id));
      const existingCourseGroupIds = new Set(
        courseGroups.map((cg) => cg.course_group_id)
      );

      const invalidCourseIds = courseIds.filter(
        (id) => !existingCourseIds.has(id)
      );
      if (invalidCourseIds.length)
        throw new BadRequestException(
          `Invalid course_id(s): ${invalidCourseIds.join(", ")} not found.`
        );

      const invalidCourseGroupIds = courseGroupIds.filter(
        (id) => !existingCourseGroupIds.has(id)
      );
      if (invalidCourseGroupIds.length)
        throw new BadRequestException(
          `Invalid course_group_id(s): ${invalidCourseGroupIds.join(", ")} not found.`
        );

      // Create brochure entry (only one)
      const collegeBrochure = new CollegeBrochure();
      collegeBrochure.brochure_title = create.brochure_title;
      collegeBrochure.brochure_file = brochure_file;
      collegeBrochure.year = Number(create.year);
      collegeBrochure.college_id = college[0].college_id;

      const savedBrochure =
        await this.collegeBrochureRepository.save(collegeBrochure);

      // Create mapping entries for course_id and course_group_id
      const mappings: BrochureMapping[] = [];

      for (const courseId of courseIds) {
        mappings.push(
          Object.assign(new BrochureMapping(), {
            brochure_id: savedBrochure,
            course_type: CourseGroupType.COURSE,
            course_type_id: courseId,
          })
        );
      }

      for (const courseGroupId of courseGroupIds) {
        mappings.push(
          Object.assign(new BrochureMapping(), {
            brochure_id: savedBrochure,
            course_type: CourseGroupType.COURSE_GROUP,
            course_type_id: courseGroupId,
          })
        );
      }

      await this.dataSource.getRepository(BrochureMapping).save(mappings);

      await this.logService.createLog(
        userId,
        LogType.COLLEGE,
        `Brochure created successfully by user with ID ${userId}`,
        1,
        RequestType.POST,
        create.college_id,
        { ...create, brochure_file }
      );

      return {
        success: true,
        message: "Brochure created successfully",
        result: { ...create, brochure_file },
      };
    });
  }

  async updateCollegeBrochure(
    update: UpdateCollegeBrochureDTO,
    brochure_id: number,
    file: File,
    userId: number
  ) {
    return tryCatchWrapper(async () => {
      const brochure = await this.dataSource.query(
        `SELECT * FROM college_brochure WHERE brochure_id = $1`,
        [brochure_id]
      );

      if (!brochure.length) {
        throw new BadRequestException(
          `Invalid ${brochure_id} ID, Brochure not found.`
        );
      }

      let brochure_file = brochure[0].brochure_file;

      if (file) {
        brochure_file = await this.uploadService.uploadFile(
          file,
          `college/brochure/${brochure[0].college_id}-${new Date().toISOString()}`
        );
      }

      const fieldsToUpdate = {
        brochure_title: update.brochure_title,
        brochure_file,
        year: update.year,
        updated_at: new Date(),
      };

      Object.keys(fieldsToUpdate).forEach(
        (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
      );

      await this.dataSource.query(
        `UPDATE college_brochure SET ${Object.keys(fieldsToUpdate)
          .map((key, index) => `${key} = $${index + 1}`)
          .join(
            ", "
          )} WHERE brochure_id = $${Object.values(fieldsToUpdate).length + 1}`,
        [...Object.values(fieldsToUpdate), brochure_id]
      );

      const existingMappings = await this.dataSource.query(
        `SELECT course_type, course_type_id FROM brochure_mapping WHERE brochure_id = $1`,
        [brochure_id]
      );

      const existingCourseIds = new Set(
        existingMappings
          .filter((m) => m.course_type === CourseGroupType.COURSE)
          .map((m) => m.course_type_id)
      );

      const existingCourseGroupIds = new Set(
        existingMappings
          .filter((m) => m.course_type === CourseGroupType.COURSE_GROUP)
          .map((m) => m.course_type_id)
      );

      const parseIds = (value: any) => {
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed)
              ? parsed
                  .map((id) => Number(id))
                  .filter((id) => !isNaN(id) && id > 0)
              : !isNaN(Number(value))
                ? [Number(value)] 
                : [];
          } catch (e) {
            return !isNaN(Number(value)) ? [Number(value)] : [];
          }
        }

        return Array.isArray(value)
          ? value.map((id) => Number(id)).filter((id) => !isNaN(id) && id > 0)
          : typeof value === "number" && value > 0
            ? [value]
            : [];
      };

      const courseIds = parseIds(update.course_id);
      const courseGroupIds = parseIds(update.course_group_id);

      const mappingsToInsert = [];

      courseIds.forEach((courseId) => {
        if (!existingCourseIds.has(courseId)) {
          mappingsToInsert.push({
            brochure_id,
            course_type: CourseGroupType.COURSE,
            course_type_id: courseId,
          });
        }
      });

      courseGroupIds.forEach((groupId) => {
        if (!existingCourseGroupIds.has(groupId)) {
          mappingsToInsert.push({
            brochure_id,
            course_type: CourseGroupType.COURSE_GROUP,
            course_type_id: groupId,
          });
        }
      });

      if (mappingsToInsert.length) {
        const valuesString = mappingsToInsert
          .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
          .join(", ");

        const flattenedValues = mappingsToInsert.flatMap((m) => [
          m.brochure_id,
          m.course_type,
          m.course_type_id,
        ]);

        await this.dataSource.query(
          `INSERT INTO brochure_mapping (brochure_id, course_type, course_type_id) VALUES ${valuesString}`,
          flattenedValues
        );
      }

      const mappingsToDelete = [];

      if (update.course_id !== undefined) {
        existingCourseIds.forEach((courseId) => {
          if (!courseIds.includes(Number(courseId))) {
            mappingsToDelete.push({
              brochure_id,
              course_type: CourseGroupType.COURSE,
              course_type_id: courseId,
            });
          }
        });
      }

      if (update.course_group_id !== undefined) {
        existingCourseGroupIds.forEach((groupId) => {
          if (!courseGroupIds.includes(Number(groupId))) {
            mappingsToDelete.push({
              brochure_id,
              course_type: CourseGroupType.COURSE_GROUP,
              course_type_id: groupId,
            });
          }
        });
      }

      if (mappingsToDelete.length) {
        await Promise.all(
          mappingsToDelete.map((m) =>
            this.dataSource.query(
              `DELETE FROM brochure_mapping 
         WHERE brochure_id = $1 AND course_type = $2 AND course_type_id = $3`,
              [m.brochure_id, m.course_type, m.course_type_id]
            )
          )
        );
      }

      await this.logService.createLog(
        userId,
        LogType.COLLEGE,
        `Brochure updated successfully by user with ID ${userId}`,
        1,
        RequestType.PUT,
        brochure[0].college_id,
        fieldsToUpdate
      );

      return {
        success: true,
        message: "Brochure updated successfully",
        updatedFields: fieldsToUpdate,
      };
    });
  }

  async deleteCollegeBrochure(brochure_id: number, userId: number) {
    return tryCatchWrapper(async () => {
      const collegeBrochure = await this.dataSource.query(
        `SELECT * FROM college_brochure WHERE brochure_id = $1`,
        [brochure_id]
      );

      if (!collegeBrochure.length) {
        throw new BadRequestException(
          `Invalid ${brochure_id} ID, Brochure not found.`
        );
      }

      const collegeid = collegeBrochure[0].college_id;

      await this.dataSource.query(
        `DELETE FROM brochure_mapping WHERE brochure_id = $1`,
        [brochure_id]
      );

      await this.dataSource.query(
        `DELETE FROM college_brochure WHERE brochure_id = $1`,
        [brochure_id]
      );

      await this.logService.createLog(
        userId,
        LogType.COLLEGE,
        `Brochure deleted successfully by user with ID ${userId}`,
        1,
        RequestType.DELETE,
        collegeid,
        collegeBrochure[0]
      );

      return {
        success: true,
        message: "Brochure deleted successfully",
      };
    });
  }

  async getCollegeBrochure(college_id: number) {
    return tryCatchWrapper(async () => {
      // Fetch brochures for the given college_id
      const brochures = await this.dataSource.query(
        `SELECT * FROM college_brochure WHERE college_id = $1`,
        [college_id]
      );

      if (!brochures.length) {
        throw new BadRequestException(
          `No brochures found for college ID ${college_id}.`
        );
      }

      const brochureIds = brochures.map((b) => b.brochure_id);

      // Fetch mappings and join with course/course_group tables
      const mappings = await this.dataSource.query(
        `
        SELECT bm.brochure_id, bm.course_type, bm.course_type_id,
               c.course_name, cg.name AS course_group_name
        FROM brochure_mapping bm
        LEFT JOIN courses c ON bm.course_type = 'course_id' AND bm.course_type_id = c.course_id
        LEFT JOIN course_group cg ON bm.course_type = 'course_group_id' AND bm.course_type_id = cg.course_group_id
        WHERE bm.brochure_id = ANY($1)
        `,
        [brochureIds]
      );

      // Organize data in a Map
      const brochureMapping = new Map();
      mappings.forEach(
        ({
          brochure_id,
          course_type,
          course_type_id,
          course_name,
          course_group_name,
        }) => {
          if (!brochureMapping.has(brochure_id)) {
            brochureMapping.set(brochure_id, { COURSE: [], COURSE_GROUP: [] });
          }

          const mappingEntry = brochureMapping.get(brochure_id);
          if (course_type === CourseGroupType.COURSE) {
            mappingEntry.COURSE.push({
              course_id: course_type_id,
              course_name: course_name,
            });
          } else if (course_type === CourseGroupType.COURSE_GROUP) {
            mappingEntry.COURSE_GROUP.push({
              course_group_id: course_type_id,
              full_name: course_group_name,
            });
          }
        }
      );

      // Map results back to brochures
      const result = brochures.map((brochure) => ({
        ...brochure,
        courses: brochureMapping.get(brochure.brochure_id)?.COURSE || [],
        course_groups:
          brochureMapping.get(brochure.brochure_id)?.COURSE_GROUP || [],
      }));

      return result;
    });
  }
}