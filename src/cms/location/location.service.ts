import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export default class CmsLocationService {
  constructor(private readonly dataSource: DataSource) {}

  async getCountries(filter_name?: string, page?: number, limit?: number) {
    let query = `SELECT country_id, name FROM country`;
    const params: (string | number)[] = [];
    let offset = 0;

    if (filter_name) {
      query += ` WHERE name ILIKE $1`; // Use ILIKE for case-insensitive matching
      params.push(`%${filter_name}%`);
    }

    if (page && limit) {
      offset = (page - 1) * limit;
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
    }

    const countries = await this.dataSource.query(query, params);

    // Validate if no data is found
    if (countries.length === 0) {
      throw new NotFoundException("No countries found for the given filter");
    }

    return {
      success: true,
      message: "Successfully found countries.",
      data: countries,
    };
  }

  async getStates(
    parent_id?: number,
    filter_name?: string,
    page?: number,
    limit?: number
  ) {
    let query = `SELECT state_id, name FROM state`;
    const params: (string | number)[] = [];
    let offset = 0;

    if (filter_name) {
      query += ` WHERE name ILIKE $1`; // Use ILIKE for case-insensitive matching
      params.push(`%${filter_name}%`);
    } else if (parent_id) {
      query += ` WHERE country_id = $1`;
      params.push(parent_id);
    }

    if (page && limit) {
      offset = (page - 1) * limit;
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
    }

    const states = await this.dataSource.query(query, params);

    // Validate if no data is found
    if (states.length === 0) {
      throw new NotFoundException("No states found for the given filter");
    }

    return {
      success: true,
      message: "Successfully found states.",
      data: states,
    };
  }

  async getCities(
    parent_id?: number, // `state_id` as the parent
    filter_name?: string,
    page: number = 1,
    limit: number = 10
  ) {
    let query = `SELECT city_id, name FROM city`;
    const params: (string | number)[] = [];
    let offset = 0;

    // Apply filter for city name
    if (filter_name) {
      query += ` WHERE name ILIKE $1`; // Case-insensitive matching
      params.push(`%${filter_name}%`);
    } else if (parent_id) {
      query += ` WHERE state_id = $1`;
      params.push(parent_id);
    }

    // Apply pagination with LIMIT and OFFSET
    if (page && limit) {
      offset = (page - 1) * limit;
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
    }

    // Execute the main query
    const cities = await this.dataSource.query(query, params);

    // Validate if no data is found
    if (cities.length === 0) {
      throw new NotFoundException("No cities found for the given filter");
    }

    // Return the response
    return {
      success: true,
      message: "Successfully found cities.",
      data: cities,
    };
  }
}
