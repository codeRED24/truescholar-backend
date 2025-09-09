import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";
import { Connection } from "typeorm";

@Injectable()
export class AppService implements OnModuleInit {
  private redisAvailable = false; // Flag to track Redis availability

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {}

  private async checkDatabaseConnection() {
    try {
      await this.connection.query("SELECT 1");
      console.log("Successfully connected to PostgreSQL Hosted database!");
      console.log(process.env.ELASTICSEARCH_NODE);
    } catch (error) {
      console.error("Failed to connect to PostgreSQL database:", error.message);
    }
  }

  async isRedisConnected(): Promise<boolean> {
    return false;
  }

  async getData(key: string): Promise<any> {
    return this.fetchDataFromDatabase(key);
  }

  private async fetchDataFromDatabase(key: string): Promise<any> {
    try {
      const result = await this.connection.query(
        `SELECT * FROM my_table WHERE key = $1`,
        [key]
      );
      console.log("Data retrieved from database!");
      return result;
    } catch (error) {
      console.error("Failed to fetch data from database:", error.message);
      throw error;
    }
  }

  getHello(): string {
    return "Hello From truescholar! - 08-09-2025 20:024 pm";
  }
}
