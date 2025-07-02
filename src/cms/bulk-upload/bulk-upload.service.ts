import { BadRequestException, Injectable } from "@nestjs/common";
import { tryCatchWrapper } from "../../config/application.errorHandeler";
import { DataSource } from "typeorm";
import { LogsService } from "../cms-logs/logs.service";
import { LogType, RequestType } from "../../common/enums";

@Injectable()
export default class BulkUploadSeoService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logsService: LogsService
  ) {}

  async bulkUpdateSeo(
    data: any[],
    type: "exam" | "college",
    user_id: number
  ): Promise<any> {
    return tryCatchWrapper(async () => {
      if (!data || data.length === 0) {
        throw new BadRequestException("No data provided for update");
      }

      const idField = type === "exam" ? "exam_id" : "college_id";
      const tableName = type === "exam" ? "exam_content" : "college_content";
      const titleField = type === "exam" ? "topic_title" : "title";
      const selectedId =
        type === "college" ? "college_content_id" : "exam_content_id";

      // Validate existence of provided IDs in a single batch query
      const idSilosPairs = data
        .map((item) => `('${item[idField]}', '${item.silos}')`)
        .join(",");

      const existingRecords = await this.dataSource.query(`
        SELECT ${idField}, silos FROM ${tableName}
        WHERE (${idField}, silos) IN (${idSilosPairs}) AND is_active = true
      `);

      const existingMap = new Set(
        existingRecords.map((r: any) => `${r[idField]}-${r.silos}`)
      );

      // Filter valid and invalid records
      const validData = data.filter((item) =>
        existingMap.has(`${item[idField]}-${item.silos}`)
      );

      const errorIndexes = [];
      const errors = data
        .filter((item) => !existingMap.has(`${item[idField]}-${item.silos}`))
        .map((item, index) => {
          errorIndexes.push(index);
          return `row ${index + 1}: no records found with ${idField} ${item[idField]} and silos ${item.silos}`;
        });

      if (errors.length) {
        return {
          status: 400,
          success: false,
          error: errors,
          message: "Invalid input fields.",
          errorIndexes,
        };
      }

      // Prepare bulk update query
      const updateQueries = validData.map((item) => {
        const updateFields = [];
        const updateValues = [];

        if (item[titleField]) {
          updateFields.push(`${titleField} = $${updateValues.length + 1}`);
          updateValues.push(item[titleField]);
        }
        if (item.meta_desc) {
          updateFields.push(`meta_desc = $${updateValues.length + 1}`);
          updateValues.push(item.meta_desc);
        }
        if (item.seo_param) {
          updateFields.push(`seo_param = $${updateValues.length + 1}`);
          updateValues.push(item.seo_param);
        }

        if (updateFields.length > 0) {
          updateValues.push(item[idField], item.silos);
          return this.dataSource.query(
            `
            UPDATE ${tableName}
            SET ${updateFields.join(", ")}
            WHERE ${selectedId} = (
              SELECT ${selectedId} FROM ${tableName}
              WHERE ${idField} = $${updateValues.length - 1} 
                AND silos = $${updateValues.length} 
                AND is_active = true
              ORDER BY updated_at DESC
              LIMIT 1
            )
          `,
            updateValues
          );
        }
        return null;
      });

      // Execute all updates in parallel
      await Promise.all(updateQueries.filter(Boolean));

      const aggregatedMetaDesc = validData.map((item) => ({
        id: item[idField],
        silos: item.silos,
      }));

      // Logs Addition with metadata: updates
      await this.logsService.createLog(
        user_id,
        type === "exam" ? LogType.EXAMS : LogType.COLLEGE,
        `Bulk SEO update for ${type}`,
        1,
        RequestType.PUT,
        0, // No single reference ID, hence 0 or null
        aggregatedMetaDesc
      );

      return {
        success: true,
        message: "Bulk SEO update successful",
      };
    });
  }

  async bulkUpdateCollegeDetails(data: any[], user_id: number): Promise<any> {
    return tryCatchWrapper(async () => {
      if (!data || data.length === 0) {
        throw new BadRequestException("No data provided for update");
      }

      const idField = "college_id";
      const tableName = "college_info";

      const collegeIds = data.map((item) => item[idField]);
      const uniqueCollegeIds = [...new Set(collegeIds)];

      const existingRecords = await this.dataSource.query(
        `SELECT college_id FROM ${tableName} WHERE college_id = ANY($1)`,
        [uniqueCollegeIds]
      );

      const existingCollegeIds = new Set(
        existingRecords.map((item) => item.college_id)
      );

      // Separate valid and invalid records
      const validData = data.filter((item) =>
        existingCollegeIds.has(item[idField])
      );
      const errors = data
        .filter((item) => !existingCollegeIds.has(item[idField]))
        .map(
          (item, index) =>
            `Row ${index + 1}: No record found with college_id ${item[idField]}`
        );

      

      if (errors.length) {
        return {
          status: 400,
          success: false,
          errors,
          message: "Invalid input fields.",
        };
      }

      // Prepare bulk update query using CASE statements
      const updateFields = [
        "college_id",
        "is_active",
        "college_name",
        "short_name",
        "search_names",
        "parent_college_id",
        "city_id",
        "state_id",
        "area",
        "location",
        `"PIN_code"`,
        "latitude_longitude",
        "college_email",
        "college_phone",
        "college_website",
        "type_of_institute",
        "affiliated_university_id",
        "founded_year",
        "total_student",
        "campus_size",
        `"UGC_approved"`,
        "kapp_rating",
        "kapp_score",
        "refrence_url",
        "primary_stream_id",
        "nacc_grade",
        "girls_only",
        "is_university",
        "is_online",
      ];
      const updateQueries = updateFields
        .map((field) => {
          const cases = validData
            .filter((item) => item[field] !== undefined)
            .map(
              (item) =>
                `WHEN ${idField} = ${item[idField]} THEN '${item[field]}'`
            )
            .join(" ");

          return cases ? `${field} = CASE ${cases} ELSE ${field} END` : null;
        })
        .filter(Boolean)
        .join(", ");

      if (!updateQueries) {
        throw new BadRequestException("No valid fields to update.");
      }

      // Execute bulk update query
      await this.dataSource.query(
        `
        UPDATE ${tableName} 
        SET ${updateQueries}
        WHERE ${idField} = ANY($1)
      `,
        [uniqueCollegeIds]
      );

      return {
        status: 200,
        success: true,
        message: "College details updated successfully.",
        result: validData,
      };
    });
  }

  async bulkUpdateCollegewiseCourse(data: any[], user_id: number): Promise<any> {
    return tryCatchWrapper(async () => {
        if (!data || data.length === 0) {
            throw new BadRequestException("No data provided for update");
        }

        const tableName = "college_wise_course";

        const requiredKeys = new Set(["college_id", "course_id"]);
        const allFields = new Set(data.flatMap(Object.keys));

        if (![...requiredKeys].every((key) => allFields.has(key))) {
            throw new BadRequestException("Missing required fields: college_id, course_id");
        }

        const updateFields = [...allFields].filter((field) => !requiredKeys.has(field));

        if (updateFields.length === 0) {
            throw new BadRequestException("No valid fields to update.");
        }

  
        for (const item of data) {
            const updateSet = updateFields.map((field, index) => `${field} = $${index + 3}`).join(", ");

            const updateQuery = `
                UPDATE ${tableName}
                SET ${updateSet}
                WHERE college_id = $1 AND course_id = $2
                RETURNING *;
            `;

            const result = await this.dataSource.query(updateQuery, [
                item.college_id,
                item.course_id,
                ...updateFields.map((field) => item[field] ?? null),
            ]);

            if (result.length === 0) {
                console.log(`No existing entry found for college_id ${item.college_id} and course_id ${item.course_id}, skipping.`);
            }
        }

        return {
            status: 200,
            success: true,
            message: "Existing college-wise course details updated successfully. No new records added.",
        };
    });
}





  
  
  
}
