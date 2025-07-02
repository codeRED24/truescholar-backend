import { Injectable } from "@nestjs/common";
import { LogType, RequestType } from "../../common/enums";
import { DataSource, Repository } from "typeorm";
import { Logs } from "./logs.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { tryCatchWrapper } from "../../config/application.errorHandeler";

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Logs)
    private readonly logsRepository: Repository<Logs>,

    private readonly dataSource: DataSource
  ) {}

  async createLog(
    user_id: number,
    type: LogType,
    description: string,
    priority: number = 1,
    requestType: RequestType,
    reference_id: number,
    metaData: Record<string, any> = {}
  ) {
    const log = this.logsRepository.create({
      user_id,
      type,
      description,
      priority,
      requestType,
      reference_id,
      metaData,
    });

    return await this.logsRepository.save(log);
  }

  async getLogs(
    type: LogType,
    reference_id: number,
    page: number,
    limit: number,
    user_id?: number
  ) {
    let query = `SELECT l.log_id, l.type, l.created_at, l."requestType", u.name
                     FROM logs as l
                     LEFT JOIN cms_users as u ON l.user_id = u.id
                     WHERE l.type = $1 AND l.reference_id = $2`;

    // Add condition for user_id if it's provided
    const queryParams = [type, reference_id];

    if (user_id) {
      query += ` AND l.user_id = $3`; // Add user_id condition
      queryParams.push(user_id);
    }

    // Add pagination
    query += ` ORDER BY l.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    queryParams.push(limit, (page - 1) * limit);
    const logs = await this.dataSource.query(query, queryParams);
    const countQuery = `SELECT COUNT(*) FROM logs;`;
    const total = await this.dataSource.query(countQuery);

    return {
      success: true,
      data: logs,
      total: total[0].count,
    };
  }

  async getLogByType(
    type: LogType,
    reference_id?: number,
    name?: string,
    requestType?: string,
    page: number = 1,
    limit: number = 10
  ) {
    return tryCatchWrapper(async () => {
      const queryParams: any[] = [type];
      let filterConditions = "";

      // Add optional filters
      if (reference_id) {
        queryParams.push(reference_id);
        filterConditions += ` AND l.reference_id = $${queryParams.length}`;
      }

      if (name) {
        queryParams.push(`%${name}%`);
        filterConditions += ` AND u.name ILIKE $${queryParams.length}`;
      }

      if (requestType) {
        const filteredRequest = requestType
          .split(",")
          .map((type) => type.trim())
          .filter(Boolean);
      
        if (filteredRequest.length > 0) {
          queryParams.push(`{${filteredRequest.join(",")}}`); // Correct array format
          filterConditions += ` AND l."requestType" = ANY($${queryParams.length}::logs_requesttype_enum[])`;
        }
      }

      // Store parameters before pagination
      const baseQueryParams = [...queryParams];

      const query = `
        SELECT l.*, u.name 
        FROM logs AS l
        LEFT JOIN cms_users AS u ON l.user_id = u.id
        WHERE l.type = $1 ${filterConditions}
        ORDER BY l.created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
      `;

      // Add pagination parameters
      queryParams.push(limit, (page - 1) * limit);

      // Execute the logs query
      const logs = await this.dataSource.query(query, queryParams);

      // Execute a separate count query (without ORDER BY)
      const countQuery = `
        SELECT COUNT(*) AS total 
        FROM logs AS l
        LEFT JOIN cms_users AS u ON l.user_id = u.id
        WHERE l.type = $1 ${filterConditions};
      `;

      // Execute the count query without pagination params
      const total = await this.dataSource.query(countQuery, baseQueryParams);

      return {
        success: true,
        message: "Logs fetched successfully",
        logs,
        total: parseInt(total[0].total, 10),
      };
    });
  }
}
