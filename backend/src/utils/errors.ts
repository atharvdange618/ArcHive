import { HTTPException } from "hono/http-exception";
import { ContentfulStatusCode } from "hono/utils/http-status";

interface ErrorDetails {
  [key: string]: any;
}

export class AppError extends HTTPException {
  public readonly statusCode: ContentfulStatusCode;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetails;
  public readonly errorCode?: string;

  constructor(
    statusCode: ContentfulStatusCode,
    message: string,
    details?: ErrorDetails,
    errorCode?: string,
    cause?: Error
  ) {
    super(statusCode, { message, cause });
    this.statusCode = statusCode;
    this.isOperational = true; // All errors created with AppError are operational
    this.details = details;
    this.errorCode = errorCode;

    // Restore prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error types extending AppError
export class ValidationError extends AppError {
  constructor(message: string = "Validation Error", details?: ErrorDetails) {
    super(400, message, details, "VALIDATION_ERROR");
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource Not Found", details?: ErrorDetails) {
    super(404, message, details, "NOT_FOUND");
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details?: ErrorDetails) {
    super(401, message, details, "UNAUTHORIZED");
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", details?: ErrorDetails) {
    super(403, message, details, "FORBIDDEN");
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict", details?: ErrorDetails) {
    super(409, message, details, "CONFLICT");
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service Unavailable", details?: ErrorDetails) {
    super(503, message, details, "SERVICE_UNAVAILABLE");
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too Many Requests", details?: ErrorDetails) {
    super(429, message, details, "TOO_MANY_REQUESTS");
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}
