import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { DataSource, Repository } from "typeorm";
import { tryCatchWrapper } from "../../../config/application.errorHandeler";
import { InjectRepository } from "@nestjs/typeorm";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { CourseContent } from "../course-content/course-content.entity";
import { UpdateCourseContentCMSDto } from "../course-content/dto/update-course-content-cms.dto";
import { CreateCourseContentCmsDto } from "./dto/create-course-content-cms.dto";
import { LogType, RequestType } from "../../../common/enums";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";
import { File } from "@nest-lab/fastify-multer";
@Injectable()
export default class CmsCourseContentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logService: LogsService,

    private readonly uploadFile: FileUploadService,

    @InjectRepository(CourseContent)
    private courseContentRepository: Repository<CourseContent>
  ) { }

  async getCourseContentById(course_id: number) {
    return tryCatchWrapper(async () => {
      const sqlQuery = `
        SELECT DISTINCT ON (cc.silos) 
          cc.*, 
          a.author_name
        FROM 
          course_content cc
        LEFT JOIN 
          author a ON cc.author_id = a.author_id
        WHERE 
          cc.course_id = $1 
        ORDER BY 
          cc.silos, 
          cc.updated_at DESC;
      `;
  
      const courseInfoQuery = `
        SELECT 
          c.*, 
          st.stream_name, 
          cg.name AS course_group_name, 
          sp.full_name AS specialization_full_name
        FROM 
          courses c
        LEFT JOIN stream st ON c.stream_id = st.stream_id
        LEFT JOIN course_group cg ON c.course_group_id = cg.course_group_id
        LEFT JOIN specialization sp ON c.specialization_id = sp.specialization_id
        WHERE 
          c.course_id = $1;
      `;
  
      const [courseInfo, courseContents] = await Promise.all([
        this.dataSource.query(courseInfoQuery, [course_id]),
        this.dataSource.query(sqlQuery, [course_id]),
      ]);
  
      if (!courseInfo?.length) {
        throw new NotFoundException("Course content not found.");
      }
  
      
      const updatedCourseInfo = {
        ...courseInfo[0],
        course_group_name: courseInfo[0].course_group_name || null,
        specialization_full_name: courseInfo[0].specialization_full_name || null,
      };
  
      
      return {
        success: true,
        message: "Successfully found course contents.",
        data: {
          course_info: updatedCourseInfo,  
          course_contents: courseContents,
        },
      };
    });
  }
  
  
  


  async createCourseContent(
    createCourseContent: CreateCourseContentCmsDto,
    user_id: number,
    file: File
  ) {
    return tryCatchWrapper(async () => {
      const courseDetails = Object.fromEntries(
        Object.entries(createCourseContent).filter(
          ([_, value]) =>
            value !== null && value !== undefined && value !== 0 && value !== ""
        )
      );

      let og_image = "";
      if(file) {
        og_image = await this.uploadFile.uploadFile(file, "course/content")
      }

      const newCourseContent = this.courseContentRepository.create({
        ...courseDetails,
        ...(og_image && {og_featured_img: og_image}),
        created_at: new Date(),
        updated_at: new Date(),
      });

      await this.courseContentRepository.save(newCourseContent);
      await this.logService.createLog(
        user_id,
        LogType.COURSE, 
        `Course Content created successfully by user with ID ${user_id}`,
        1,
        RequestType.POST,
        createCourseContent.course_id,
        createCourseContent 
      );

      return {
        success: true,
        message: "New course content created successfully",
      };
    });
  }


  async updateCourseContentById(
    course_content_id: number,
    updateCourseContentCMSDto: UpdateCourseContentCMSDto,
    user_id: number,
    file: File
  ) {
    return tryCatchWrapper(async () => {
      let conditions: string[] = [];
      let params: (string | number | boolean)[] = [
        typeof course_content_id === "number"
          ? course_content_id
          : parseInt(course_content_id),
      ];

      const courseContent = `
        SELECT course_id FROM course_content
        WHERE course_content_id = $1
      `;

      const courseContentData = await this.dataSource.query(courseContent, [
        course_content_id,
      ]);

      if (!courseContentData.length) {
        throw new NotFoundException(
          `Course Content with ID ${course_content_id} not found`
        );
      }

      const { course_id } = courseContentData[0];

      let index = 2;
      for (const [key, value] of Object.entries(updateCourseContentCMSDto)) {
        if (
          value !== null &&
          !["course_content_id", "isContentChanged", "created_at"].includes(key)
        ) {
          conditions.push(`${key} = $${index}`);
          params.push(value);
          index++;
        }
      }

      if (conditions.length === 0) {
        throw new BadGatewayException("No valid fields to update");
      }

      let og_image = "";
      if(file) {
        og_image = await this.uploadFile.uploadFile(file, "course/content");
        conditions.push(`og_featured_img =  $${index}`)
        params.push(og_image);
      }

      const query = `
        UPDATE course_content
        SET ${conditions.join(", ")}
        ${updateCourseContentCMSDto.isContentChanged ? ", updated_at = NOW()" : ""}
        WHERE course_content_id = $1;
      `;

      await this.logService.createLog(
        user_id,
        LogType.COURSE, // LogType
        `Course Content with ID ${course_content_id} updated successfully`,
        1,
        RequestType.PUT, // RequestType
        course_id,
        updateCourseContentCMSDto // Log metadata
      );

      await this.dataSource.query(query, params);
      return {
        success: true,
        message: `Course Content with ID ${course_content_id} updated successfully`,
      };
    });
  }

  
  
}

