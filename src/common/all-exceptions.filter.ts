import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { AppLogger } from "./logger";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger("ExceptionFilter");

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    // Get error details for logging
    const errorDetails = {
      path: request.url,
      method: request.method,
      statusCode: status,
      message: typeof message === "string" ? message : JSON.stringify(message),
      timestamp: new Date().toISOString(),
    };

    // Log the error with appropriate level
    if (status >= 500) {
      // Server errors - log with stack trace
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `[${errorDetails.method}] ${errorDetails.path} - ${status} - ${errorDetails.message}`,
        stack
      );
    } else if (status >= 400) {
      // Client errors - log as warning
      this.logger.warn(
        `[${errorDetails.method}] ${errorDetails.path} - ${status} - ${errorDetails.message}`
      );
    }

    // Debug log the full exception in development
    if (process.env.NODE_ENV !== "production" && exception instanceof Error) {
      this.logger.debug(`Full exception: ${exception.message}`);
      if (exception.stack) {
        this.logger.debug(`Stack: ${exception.stack}`);
      }
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    httpAdapter.reply(response, responseBody, status);
  }
}
