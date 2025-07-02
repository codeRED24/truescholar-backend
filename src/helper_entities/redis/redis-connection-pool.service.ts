import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisConnectionPoolService {
  private redisClient: Redis | null = null;

  constructor() {
    try {
      this.redisClient = new Redis({
        host: "3.7.69.199",
        port: 6379,
        keepAlive: 10000,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error(
              "Exceeded maximum Redis reconnection attempts. Giving up."
            );
            return null; // Stop retries
          }
          return Math.min(times * 10, 200);
        },
      });

      this.redisClient.on("connect", () => {
        console.log("Connected to Redis!");
      });

      this.redisClient.on("error", (err) => {
        this.redisClient?.disconnect();
        this.redisClient = null;
      });
    } catch (err) {
      console.error("Failed to initialize Redis connection:", err.message);
      this.redisClient = null;
    }
  }

  getClient(): Redis | null {
    if (!this.redisClient) {
      console.warn("Redis is not connected. Returning null client.");
    }
    return this.redisClient;
  }

  async safeExecute<T>(
    command: (client: Redis) => Promise<T>
  ): Promise<T | null> {
    if (!this.redisClient) {
      console.warn("Redis is not available. Skipping command execution.");
      return null;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn("Redis command timed out. Returning null.");
        resolve(null);
      }, 5000); // 5-second timeout

      command(this.redisClient)
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          console.error("Error executing Redis command:", error.message);
          resolve(null);
        });
    });
  }
}
