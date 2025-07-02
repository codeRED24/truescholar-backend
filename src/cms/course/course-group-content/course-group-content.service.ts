import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CourseGroupContent } from "./course-group-content.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { createCourseGroupContentDto } from "./dto/create-course-group-content.dto";
import { File } from "@nest-lab/fastify-multer";
import { tryCatchWrapper } from "../../../config/application.errorHandeler";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { LogType, RequestType } from "../../../common/enums";
import { UpdateCourseGroupContentDto } from "./dto/update-course-group-content.dto";

@Injectable()
export class CourseGroupContentService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(CourseGroupContent)
    private readonly courseGoupContent: Repository<CourseGroupContent>,

    private readonly fileService: FileUploadService,

    private readonly logService: LogsService
  ) {}

  async createCourseGroupContent(
    create: createCourseGroupContentDto,
    og_featured_img: File | undefined,
    user_id: number
  ) {
    return tryCatchWrapper(async () => {
      let og_image = "";

      if (og_featured_img) {
        og_image = await this.fileService.uploadFile(
          og_featured_img,
          "course_group/content"
        );
      }

     

      const courseGroupId = Number(create.course_group_id);
      const collegeId = Number(create.college_id);
  
      if (isNaN(courseGroupId)) {
        throw new BadRequestException("course_group_id must be a valid number.");
      }
  
      if (isNaN(collegeId)) {
        throw new BadRequestException("college_id must be a valid number.");
      }

      const courseGroup = await this.dataSource.query(
        "SELECT course_group_id FROM course_group WHERE course_group_id = $1",
        [create.course_group_id]
      );

      const college = await this.dataSource.query(
        "SELECT college_id FROM college_info WHERE college_id = $1",
        [create.college_id]
      );

      if (!courseGroup) {
        throw new BadRequestException(
          `Course Group with ID ${create.course_group_id} not found.`
        );
      }

      if (!college) {
        throw new BadRequestException(
          `College with ID ${create.college_id} not found.`
        );
      }

      const isActiveValue =
            typeof create.is_active === "boolean"
                ? create.is_active
                : create.is_active === "true" || create.is_active === true;

      const courseGroupContent = this.courseGoupContent.create({
        ...create,
        is_active: isActiveValue,
        ...(og_image && { og_featured_img: og_image }),
        course_group_id: {course_group_id: courseGroupId},
        college_id: {college_id: collegeId},
      });

      const savedContent =
        await this.courseGoupContent.save(courseGroupContent);

      await this.logService.createLog(
        user_id,
        LogType.COURSE,
        `Course Content created successfully by user with ID ${user_id}`,
        1,
        RequestType.POST, 
        create.course_group_id,
        { create, ...{ og_image } }
      );

      return {
        success: true,
        message: "Course group content created successfully",
        result: savedContent,
      };
    });
  }

  async updateCourseGroupContent(
      update: UpdateCourseGroupContentDto,
      course_group_id: number,
      og_featured_img?: File,
      user_id?: number,
    ) {
      return tryCatchWrapper(async () => {
        let conditions: string[] = [];
        let params: (string | number | boolean)[] = [
          typeof course_group_id === "number"
            ? course_group_id
            : parseInt(course_group_id),
        ];
  
        const courseGroupContent = `
          Select course_group_id from course_group_content
          where course_group_id = $1
        `;
  
        const courseGroupContentData = await this.dataSource.query(courseGroupContent, [
          course_group_id,
        ]);
  
        if (!courseGroupContentData.length) {
          throw new NotFoundException(
            `Course Group Content with ID ${course_group_id} not found`
          );
        }
  
        const { course_group_content_id } = courseGroupContentData[0];
  
        let index = 2;
        for (const [key, value] of Object.entries(update)) {
          if (
            value !== null &&
            !["course_group_content_id", "isContentChanged", "created_at"].includes(
              key
            )
          ) {
            conditions.push(`${key} = $${index}`);
            params.push(value);
            index++;
          }
        }
  
        let og_image = "";
        if (og_featured_img) {
           og_image = await this.fileService.uploadFile(
            og_featured_img,
            "course_group/content"
          );
          conditions.push(`og_featured_img = $${index}`);
          params.push(og_image);
        }
  
        if (conditions.length === 0) {
          throw new BadGatewayException("No valid fields to update");
        }
  
        const query = `
          UPDATE course_group_content
          SET ${conditions.join(", ")}
          ${update.isContentChanged ? ", updated_at = NOW()" : ""}
          WHERE course_group_id = $1;
        `;
  
        await this.logService.createLog(
          user_id,
          LogType.COURSE,
          `Course Group Content with ID ${course_group_content_id} updated successfully`,
          1,
          RequestType.PUT, 
          course_group_id,
          {update, ...{og_image}}
        );
  
        await this.dataSource.query(query, params);
        return {
          success: true,
          message: `Course Group Content with ID ${course_group_id} updated successfully`,
        };
      });
    }

  async getCourseGroupContent(course_group_id: number) {
    return tryCatchWrapper(async () => {

        const courseGroupContent = `
            SELECT cg.*, a.author_name
            FROM course_group_content as cg 
            Left join author as a
            on cg.author_id = a.author_id
            WHERE course_group_id = $1;
        `;
    
        const courseGroupContentData = await this.dataSource.query(courseGroupContent, [
            course_group_id,
        ]);
    
        if (!courseGroupContentData.length) {
            throw new NotFoundException(
            `Course Group Content with ID ${course_group_id} not found`
            );
        }
    
        return {
            success: true,
            message: `Course Group Content with ID ${course_group_id} fetched successfully`,
            result: courseGroupContentData[0],
        }
    });
  }

  async getCourseGroupContentByCollege(college_id: number, page: number, limit: number) {

    return tryCatchWrapper(async () => {
      const college = await this.dataSource.query(
        "SELECT college_id FROM college_info WHERE college_id = $1",
        [college_id]
      );

      if (!college) {
        throw new BadRequestException(
          `College with ID ${college_id} not found.`
        );
      }

      const courseGroupContent = `
        SELECT DISTINCT(cwc.course_group_id), cg.name, cg.type
        FROM college_wise_course as cwc
        LEFT JOIN course_group as cg
        ON cwc.course_group_id = cg.course_group_id
        WHERE cwc.college_id = $1 AND cwc.is_active = true
        LIMIT $2 OFFSET $3;
      `;

      const courseGroupContentData = await this.dataSource.query(courseGroupContent, [
        college_id,
        limit,
        (page - 1) * limit,
      ]);

      const totalCount = await this.dataSource.query(
        "SELECT COUNT(DISTINCT(cwc.course_group_id)) FROM college_wise_course as cwc WHERE cwc.college_id = $1 AND cwc.is_active = true;",
        [college_id]
      );

      return {
        success: true,
        message: `Course Group Content for College with ID ${college_id} fetched successfully`,
        result: {course_group_data: courseGroupContentData , total_count: totalCount[0].count},
      };
    })
  }

  async getAllCourseGroupContent(course_group_name: string, page?: number, limit?: number) {
    return tryCatchWrapper(async () => {
      const params: any[] = [];
      if (course_group_name) params.push(`%${course_group_name}%`);
      let paginationClause = "";

 
      if (page && limit) {
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        paginationClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;
      }

      // Main query
      const query = `
        SELECT course_group_id, full_name
        FROM course_group
        ${course_group_name ? "WHERE full_name ILIKE $1" : ""}
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

