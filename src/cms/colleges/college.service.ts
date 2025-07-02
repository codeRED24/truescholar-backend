import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CreateCollegeInfoDto } from "./dto/create-college-info.dto";
import { CollegeInfo } from "../../college/college-info/college-info.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CollegeFilterDtoModified } from "./dto/college-filter.dto";
import { LogsService } from "../cms-logs/logs.service";
import { LogType, RequestType } from "../../common/enums";
import { tryCatchWrapper } from "../../config/application.errorHandeler";
import { File } from "@nest-lab/fastify-multer";
import { FileUploadService } from "../../utils/file-upload/fileUpload.service";
import { UpdateCollegeInfoDTO } from "./dto/update-college-info.dto";

@Injectable()
export default class CmsCollegeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logsService: LogsService,
    private readonly fileUploadService: FileUploadService,

    @InjectRepository(CollegeInfo)
    private readonly collegeInfoRepository: Repository<CollegeInfo>
  ) {}

  async createCollege(
    createCollegeInfoDto: CreateCollegeInfoDto,
    user_id: number,
    logo_file?: File,
    banner_file?: File
  ) {
    return tryCatchWrapper(async () => {
      let logoUrl = "";
      let bannerUrl = "";
      if (logo_file) {
        logoUrl = await this.fileUploadService.uploadFile(
          logo_file,
          "allCollegeLogo/logo"
        );
      }
      if (banner_file) {
        bannerUrl = await this.fileUploadService.uploadFile(
          banner_file,
          "allCollegeBanner/banner"
        );
      }

      const collegeInfo = this.collegeInfoRepository.create({
        ...createCollegeInfoDto,
        is_active: false,
        ...(logoUrl && { logo_img: logoUrl }),
        ...(bannerUrl && { banner_img: bannerUrl }),
      });

      let savedCollegeInfo = await this.collegeInfoRepository.save(collegeInfo);

      if (
        savedCollegeInfo.slug &&
        !savedCollegeInfo.slug.includes(`-${savedCollegeInfo.college_id}`)
      ) {
        savedCollegeInfo.slug = savedCollegeInfo.slug.replace("-undefined", "");
        savedCollegeInfo.slug = `${savedCollegeInfo.slug}-${savedCollegeInfo.college_id}`;
        savedCollegeInfo =
          await this.collegeInfoRepository.save(savedCollegeInfo);
      }

      await this.logsService.createLog(
        user_id,
        LogType.COLLEGE,
        `College  created successfully by user with ID ${user_id}`,
        1,
        RequestType.POST, // RequestType
        collegeInfo.college_id,
        createCollegeInfoDto
      );

      return {
        success: true,
        message: "Successfully added new college.",
        college_id: collegeInfo.college_id,
      };
    });
  }

  async getAllColleges(
    filter: CollegeFilterDtoModified,
    page: number = 1,
    limit: number = 10
  ) {
    const {
      college_name,
      is_online,
      is_university,
      girls_only,
      is_active,
      type_of_institute,
      state_name,
      city_name,
      college_id,
    } = filter;

    const selectedTypes = type_of_institute
      ? type_of_institute.split(",").filter((type) => type)
      : [];

    let baseQuery = `
      FROM college_info ci
      LEFT JOIN city c ON ci.city_id = c.city_id
      LEFT JOIN state s ON ci.state_id = s.state_id
      LEFT JOIN country co ON ci.country_id = co.country_id
    `;

    const params: (string | number | boolean)[] = [];
    const conditions: string[] = [];

    // Add filters dynamically
    if (college_name) {
      conditions.push(`ci.college_name ILIKE $${params.length + 1}`);
      params.push(`%${college_name}%`);
    }

    if (college_id) {
      conditions.push(`ci.college_id = $${params.length + 1}`);
      params.push(college_id);
    }

    if (is_online !== undefined) {
      conditions.push(`ci.is_online = $${params.length + 1}`);
      params.push(is_online);
    }

    if (is_university !== undefined) {
      conditions.push(`ci.is_university = $${params.length + 1}`);
      params.push(is_university);
    }

    if (girls_only !== undefined) {
      conditions.push(`ci.girls_only = $${params.length + 1}`);
      params.push(girls_only);
    }

    if (is_active !== undefined) {
      conditions.push(`ci.is_active = $${params.length + 1}`);
      params.push(is_active);
    }

    if (city_name || state_name) {
      let combinedCondition;

      if (city_name && state_name) {
        combinedCondition = `(c.name ILIKE $${params.length + 1} AND s.name ILIKE $${params.length + 2})`;
        params.push(`%${city_name}%`, `%${state_name}%`);
      } else {
        const cityCondition = city_name
          ? `c.name ILIKE $${params.length + 1}`
          : null;
        const stateCondition = state_name
          ? `s.name ILIKE $${params.length + 1}`
          : null;
        combinedCondition = cityCondition || stateCondition;
        params.push(`%${city_name || state_name}%`);
      }

      conditions.push(combinedCondition);
    }

    // Use IN clause for selectedTypes
    if (selectedTypes.length) {
      const placeholders = selectedTypes
        .map((_, index) => `$${params.length + index + 1}`)
        .join(", ");
      conditions.push(`ci.type_of_institute IN (${placeholders})`);
      params.push(...selectedTypes);
    }

    // Combine filters into a WHERE clause
    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Query for total number of colleges
    const totalQuery = `SELECT COUNT(*) ${baseQuery}`;

    // Query for paginated results
    let paginatedQuery = `
      SELECT 
        ci.college_id, 
        ci.college_name, 
        ci.type_of_institute, 
        ci.kapp_score,
        c.name AS city_name, 
        s.name AS state_name, 
        co.name AS country_name
      ${baseQuery}
    `;

    // Add pagination logic
    const offset = (page - 1) * limit;
    paginatedQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    try {
      // Execute both queries
      const [totalResult, paginatedResult] = await Promise.all([
        this.dataSource.query(totalQuery, params.slice(0, params.length - 2)),
        this.dataSource.query(paginatedQuery, params),
      ]);

      const totalColleges = totalResult.length
        ? parseInt(totalResult[0].count, 10)
        : 0;

      // Return the data
      return {
        success: true,
        message:
          totalColleges > 0
            ? "Successfully found colleges."
            : "No colleges found.",
        total: totalColleges,
        data: paginatedResult,
      };
    } catch (error) {
      console.error("Error fetching colleges:", error);
      throw new BadGatewayException("Error fetching colleges.");
    }
  }

  async updateCollege(
    updateCollegeInfoDTO: UpdateCollegeInfoDTO,
    college_id: number,
    user_id: number,
    logo_file?: File,
    banner_file?: File
  ) {
    return tryCatchWrapper(async () => {
      const fields = [];
      const values: (number | string)[] = [college_id];

      const existingCollege = await this.dataSource.query(
        "SELECT college_id FROM college_info WHERE college_id = $1",
        [college_id]
      );

      if (existingCollege.length === 0) {
        throw new Error(`College with ID ${college_id} not found`);
      }

      // Check wheather the college has active info silo or not.
      if (updateCollegeInfoDTO?.is_active) {
        const infoArticle = await this.dataSource.query(
          "SELECT silos from college_content WHERE college_id = $1 AND silos = $2 AND is_active = $3",
          [college_id, "info", true]
        );
        if (!infoArticle?.length) {
          throw new BadRequestException(
            "To activate the college, an active info article is mandatory."
          );
        }
      }

      let index = 2;
      for (const [key, value] of Object.entries(updateCollegeInfoDTO)) {
        if (value || value === false) {
          // Use double quotes for special column names
          if (["PIN_code", "UGC_approved"].includes(key)) {
            fields.push(`"${key}" = $${index}`);
          } else {
            fields.push(`${key} = $${index}`);
          }
          values.push(value);
          index++;
        }
      }

      if (logo_file) {
        const logoUrl = await this.fileUploadService.uploadFile(
          logo_file,
          "allCollegeLogo/logo"
        );
        fields.push(`logo_img = $${index++}`);
        values.push(logoUrl);
      }

      if (banner_file) {
        const bannerURL = await this.fileUploadService.uploadFile(
          banner_file,
          "allCollegeBanner/banner"
        );
        fields.push(`banner_img = $${index++}`);
        values.push(bannerURL);
      }

      if (fields.length === 0) {
        throw new Error(
          `No valid fields to update for college ID ${college_id}`
        );
      }

      // Add `updated_at` field
      const query = `
        UPDATE college_info
        SET ${fields.join(", ")}, updated_at = NOW()
        WHERE college_id = $1;
      `;

      // Execute the query
      await this.dataSource.query(query, values);

      // Log the update
      await this.logsService.createLog(
        user_id,
        LogType.COLLEGE,
        `College with ID ${college_id} updated successfully`,
        1,
        RequestType.PUT,
        college_id,
        updateCollegeInfoDTO
      );

      return {
        success: true,
        message: `College with ID ${college_id} updated successfully`,
      };
    });
  }

  async searchCollege(college_name: string, page?: number, limit?: number) {
    return tryCatchWrapper(async () => {
      const params: any[] = [];
      if (college_name) params.push(`%${college_name}%`);
      let paginationClause = "";

      // Add LIMIT and OFFSET only if page and limit are provided
      if (page && limit) {
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        paginationClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;
      }

      // Main query
      const query = `
        SELECT college_name 
        FROM college_info
        ${college_name ? "WHERE college_name ILIKE $1" : ""}
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

  async getCollegeSearch(college_name: string, page?: number, limit?: number) {
    return tryCatchWrapper(async () => {
      const params: any[] = [];
      if (college_name) params.push(`%${college_name}%`);
      let paginationClause = "";

      if (page && limit) {
        const offset = (page - 1) * limit;
        params.push(limit, offset);
        paginationClause = `LIMIT $${params.length - 1} OFFSET $${params.length}`;
      }

      // Main query
      const query = `
        SELECT college_id, college_name 
        FROM college_info
        ${college_name ? "WHERE college_name ILIKE $1" : ""}
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
