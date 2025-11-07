import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ThrottlerException } from "@nestjs/throttler";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const isProduction = process.env.NODE_ENV === "production";

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object = "Internal server error";
    let stack: string | undefined;

    // Handle ThrottlerException specifically
    if (exception instanceof ThrottlerException) {
      message = "Too many requests. Please try again later.";
    } else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null
      ) {
        message = (exceptionResponse as any).message || "Internal server error";
        stack = (exceptionResponse as any).stack;
      }
    } else if (exception instanceof Error) {
      message = isProduction ? "Internal server error" : exception.message;
      stack = exception.stack;
    }

    const responseBody: Record<string, any> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    if (!isProduction && stack) {
      responseBody.stack = stack;
    }

    // Log the full exception internally, regardless of environment
    console.error(exception);

    httpAdapter.reply(response, responseBody, status);
  }
}
