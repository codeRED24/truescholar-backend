import { Injectable, NestMiddleware } from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";
import { AppLogger } from "./logger.service";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new AppLogger("HTTP");

  use(
    req: FastifyRequest["raw"],
    res: FastifyReply["raw"],
    next: () => void
  ): void {
    const startTime = Date.now();
    const { method, url } = req;

    // Get client IP
    const ip =
      (req.headers["x-forwarded-for"] as string) ||
      (req.headers["x-real-ip"] as string) ||
      req.socket?.remoteAddress ||
      "unknown";

    // Log when response finishes
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      this.logger.logRequest(
        method || "UNKNOWN",
        url || "/",
        statusCode,
        duration,
        ip
      );
    });

    next();
  }
}
