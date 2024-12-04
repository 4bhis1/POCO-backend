// throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid email data.");

interface options {
  type: string | undefined;
  isOperational: boolean | undefined;
  stack: string | undefined;
}

class ApiError extends Error {
  type: string;
  statusCode: number;
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    options?: options
  ) {
    super(message);
    const { type, isOperational = true, stack } = options || {};

    this.type = type || "Error";
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
