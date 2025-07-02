import { Injectable } from "@nestjs/common";
import { tryCatchWrapper } from "../../config/application.errorHandeler";
import { DataSource } from "typeorm";

@Injectable()
export class CmsAuthorsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(page: number = 1, limit: number = 10, author_name?: string) {
    return tryCatchWrapper(async () => {
      let conditions: string[] = [];
      let params: (string | number)[] = [];

      // Add the author_name condition
      if (author_name) {
        conditions.push(`a.author_name ILIKE $${params.length + 1}`);
        params.push(`%${author_name}%`);
      }

      const offset = (page - 1) * limit;
      params.push(limit, offset);

      // Add conditions to the query
      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      // Construct the SQL query
      const query = `
        SELECT author_id, author_name
        FROM author a
        ${whereClause}
        LIMIT $${params.length - 1} OFFSET $${params.length};
      `;

      // Execute the query
      const result = await this.dataSource.query(query, params);

      return {
        success: true,
        message: "Successfully fetched all authors",
        result,
      };
    });
  }
}
