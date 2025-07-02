import { HttpException, HttpStatus } from "@nestjs/common";

export const tryCatchWrapper = async <T>(
  fn: () => Promise<T>
): Promise<T | void> => {
  try {
    return await fn();
  } catch (error) {
    const errorTypes = [
      "NotFoundException",
      "BadRequestException",
      "UnauthorizedException",
    ];
    if (!errorTypes.includes(error.name)) {
      console.error("Error occurred:", error);
    }

    // Throw an HTTP exception
    throw new HttpException(
      {
        status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || "An unexpected error occurred.",
      },
      error.status || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
};
