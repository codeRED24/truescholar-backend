import { ConsoleLogger, Injectable, LogLevel, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  private static logLevels: LogLevel[] =
    process.env.NODE_ENV === "production"
      ? ["log", "warn", "error"]
      : ["log", "warn", "error", "debug", "verbose"];

  constructor(context?: string) {
    super(context || "App");
    this.setLogLevels(AppLogger.logLevels);
  }

  /**
   * Log an HTTP request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    ip?: string
  ): void {
    const message = `${method} ${url} ${statusCode} ${duration}ms${ip ? ` [${ip}]` : ""}`;

    if (statusCode >= 500) {
      super.error(message, undefined, "HTTP");
    } else if (statusCode >= 400) {
      super.warn(message, "HTTP");
    } else {
      super.log(message, "HTTP");
    }
  }

  /**
   * Log a database query (for debugging)
   */
  logQuery(query: string, parameters?: unknown[], duration?: number): void {
    const truncatedQuery =
      query.length > 200 ? `${query.substring(0, 200)}...` : query;
    const message = duration
      ? `Query: ${truncatedQuery} [${duration}ms]`
      : `Query: ${truncatedQuery}`;
    super.debug(message, "Database");
  }

  /**
   * Log an info message
   */
  info(message: string, context?: string): void {
    super.log(message, context);
  }

  /**
   * Create a child logger with a specific context
   */
  child(context: string): AppLogger {
    return new AppLogger(context);
  }
}
