import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export default class CmsStreamService {
  constructor(private readonly dataSource: DataSource) {}

  async getStreams(filter_name?: string, page?: number, limit?: number) {
    let query = `SELECT stream_id, stream_name FROM stream`;
    const params: (string | number)[] = [];
    let offset = 0;

    // Add filter condition for stream name
    if (filter_name) {
      query += ` WHERE stream_name ILIKE $1`; // Use ILIKE for case-insensitive matching
      params.push(`%${filter_name}%`);
    }

    // Add pagination logic
    if (page && limit) {
      offset = (page - 1) * limit;
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
    }

    const streams = await this.dataSource.query(query, params);

    // Validate if no data is found
    if (streams.length === 0) {
      throw new NotFoundException("No streams found for the given filter");
    }

    return {
      success: true,
      message: "Successfully found streams.",
      data: streams,
    };
  }
}
