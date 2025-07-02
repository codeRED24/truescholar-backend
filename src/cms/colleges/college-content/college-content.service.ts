import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { tryCatchWrapper } from "../../../config/application.errorHandeler";
import { UpdateCollegeContentCMSDto } from "./dto/update-college-content-cms.dto";
import { LogsService } from "../../../cms/cms-logs/logs.service";
import { LogType, RequestType } from "../../../common/enums";
import { CreateCollegeContentCMSDto } from "./dto/create-college-content-cms.dto";
import { CollegeContent } from "../../../college/college-content/college-content.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { File } from "@nest-lab/fastify-multer";
import { FileUploadService } from "../../../utils/file-upload/fileUpload.service";

@Injectable()
export default class CmsCollegeContentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logService: LogsService,
    private readonly fileUploadService: FileUploadService,

    @InjectRepository(CollegeContent)
    private collegeContentRepository: Repository<CollegeContent>
  ) {}

  async getCollegeContentById(college_id: number) {
    return tryCatchWrapper(async () => {
      const sqlQuery = `
          SELECT DISTINCT ON (cc.silos) 
              cc.*, 
              a.author_name
          FROM 
              college_content cc
          LEFT JOIN 
              author a 
          ON 
              cc.author_id = a.author_id
          WHERE 
              cc.college_id = $1 
          ORDER BY 
              cc.silos, 
              cc.updated_at DESC;
      `;

      const collegeInfoQuery = `
            SELECT 
              c.*,
              co.name as country_name,
              s.name as state_name,
              ci.name as city_name,
              st.stream_name
            FROM 
              college_info c 
            INNER JOIN country co ON c.country_id = co.country_id
            LEFT JOIN state s ON c.state_id = s.state_id
            LEFT JOIN city ci ON c.city_id = ci.city_id
            LEFT JOIN stream st ON c.primary_stream_id = st.stream_id
            WHERE college_id = $1;`;

      const collegeWiseCoursesQuery = `
        SELECT DISTINCT(cwc.course_group_id), cg.name, cg.full_name
        FROM college_wise_course as cwc
        LEFT JOIN course_group as cg
        ON cwc.course_group_id = cg.course_group_id
        WHERE cwc.college_id = $1 AND cwc.is_active = true and cg.is_active = true;
      `;

      const [collegeInfo, collegeContents, collegeWiseCourses] = await Promise.all([
        this.dataSource.query(collegeInfoQuery, [college_id]),
        this.dataSource.query(sqlQuery, [college_id]),
        this.dataSource.query(collegeWiseCoursesQuery, [college_id])
      ]);

      if (!collegeInfo?.length) {
        throw new NotFoundException("College content not found.");
      }

      // Getting the college info article from templatization table.
      const templatizationContent = await this.dataSource.query(
        "SELECT * FROM templatization_college_content WHERE college_id = $1;",
        [college_id]
      );

      return {
        success: true,
        message: "Successfully found college contents.",
        data: {
          college_info: collegeInfo[0],
          college_contents: collegeContents,
          college_wise_courses: collegeWiseCourses,
          ...(templatizationContent && { templatizationContent }),
        },
      };
    });
  }

  async updateCollegeContentById(
    college_content_id: number,
    updateCollegeContentCMSDto: UpdateCollegeContentCMSDto,
    user_id: number,
    og_featured_img?: File
  ) {
    return tryCatchWrapper(async () => {
      let conditions: string[] = [];
      let params: (string | number | boolean)[] = [
        typeof college_content_id === "number"
          ? college_content_id
          : parseInt(college_content_id),
      ];

      const collegeContent = `
        Select college_id from college_content
        where college_content_id = $1
      `;

      const collegeContentData = await this.dataSource.query(collegeContent, [
        college_content_id,
      ]);

      if (!collegeContentData.length) {
        throw new NotFoundException(
          `College Content with ID ${college_content_id} not found`
        );
      }

      const { college_id } = collegeContentData[0];

      let index = 2;
      for (const [key, value] of Object.entries(updateCollegeContentCMSDto)) {
        if (
          value !== null &&
          !["college_content_id", "isContentChanged", "created_at"].includes(
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
         og_image = await this.fileUploadService.uploadFile(
          og_featured_img,
          "college/content"
        );
        conditions.push(`og_featured_img = $${index}`);
        params.push(og_image);
      }

      if (conditions.length === 0) {
        throw new BadGatewayException("No valid fields to update");
      }

      const query = `
        UPDATE college_content
        SET ${conditions.join(", ")}
        ${updateCollegeContentCMSDto.isContentChanged ? ", updated_at = NOW()" : ""}
        WHERE college_content_id = $1;
      `;

      await this.logService.createLog(
        user_id,
        LogType.COLLEGE, // LogType
        `College Content with ID ${college_content_id} updated successfully`,
        1,
        RequestType.PUT, // RequestType
        college_id,
        {updateCollegeContentCMSDto, ...{og_image}}// Log metadata
      );

      await this.dataSource.query(query, params);
      return {
        success: true,
        message: `College with ID ${college_content_id} updated successfully`,
      };
    });
  }

  async deleteCollegeContent(college_content_id: number, user_id: number) {
    return tryCatchWrapper(async () => {
      const collegeContent = `
      Select college_id from college_content
      where college_content_id = $1
    `;

      const collegeContentData = await this.dataSource.query(collegeContent, [
        college_content_id,
      ]);

      if (!collegeContentData.length) {
        throw new NotFoundException(
          `College Content with ID ${college_content_id} not found`
        );
      }

      const { college_id } = collegeContentData[0];

      const query = `
        DELETE FROM college_content
        WHERE college_content_id = $1;
      `;

      await this.logService.createLog(
        user_id,
        LogType.COLLEGE,
        `College Content with ID ${college_content_id} deleted successfully`,
        1,
        RequestType.DELETE,
        college_id,
        {}
      );

      const deletedCollegeContent = await this.dataSource.query(query, [
        college_content_id,
      ]);

      return {
        message: `College with ID ${college_content_id} deleted successfully`,
        result: deletedCollegeContent,
      };
    });
  }

  async createCollegeContent(
    createCollegeContent: CreateCollegeContentCMSDto,
    user_id: number,
    og_featured_img: File
  ) {
    return tryCatchWrapper(async () => {
      const collegeDetails = Object.fromEntries(
        Object.entries(createCollegeContent).filter(
          ([_, value]) =>
            value !== null && value !== undefined && value !== 0 && value !== ""
        )
      );

      let og_image = "";
      if (og_featured_img) {
        og_image = await this.fileUploadService.uploadFile(
          og_featured_img,
          "college/content"
        );
      }

      const createCollege = this.collegeContentRepository.create({
        ...collegeDetails,
        ...(og_image && { og_featured_img: og_image }),
        created_at: new Date(),
        updated_at: new Date(),
      });

      await this.collegeContentRepository.save(createCollege);
      await this.logService.createLog(
        user_id,
        LogType.COLLEGE, // LogType
        `College Content created successfully by user with ID ${user_id}`,
        1,
        RequestType.POST, // RequestType
        createCollegeContent.college_id,
        {createCollegeContent, ...{og_image}} // Log metadata
      );

      return {
        success: true,
        message: "New college content created successfully",
      };
    });
  }
}
