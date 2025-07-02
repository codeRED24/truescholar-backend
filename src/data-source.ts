import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST_NEST,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + "/**/*.entity{.ts,.js}"], // Adjust path if needed
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  synchronize: false, // Always false when using migrations
  logging: false,
});
