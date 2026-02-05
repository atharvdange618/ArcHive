import { rateLimiter } from "hono-rate-limiter";
import { TooManyRequestsError } from "../utils/errors";
import { MiddlewareHandler } from "hono";
import { config } from "../config";

/**
 * Rate limiting configurations for different endpoint types
 */

// Helper to bypass rate limiting in test environment
const createRateLimiter = (options: any): MiddlewareHandler => {
  if (config.NODE_ENV === "test") {
    return async (c, next) => await next();
  }
  return rateLimiter(options);
};

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-6",
  keyGenerator: (c: any) => {
    return (
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"
    );
  },
  handler: (c: any) => {
    throw new TooManyRequestsError(
      "Too many authentication attempts. Please try again later.",
    );
  },
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: (c: any) => {
    const user = c.get("user");
    const ip =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    return user ? `${user._id}-${ip}` : ip;
  },
  handler: (c: any) => {
    throw new TooManyRequestsError("Too many requests. Please slow down.");
  },
});

export const searchRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-6",
  keyGenerator: (c: any) => {
    const user = c.get("user");
    const ip =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    return user ? `${user._id}-${ip}` : ip;
  },
  handler: (c: any) => {
    throw new TooManyRequestsError(
      "Too many search requests. Please slow down.",
    );
  },
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-6",
  keyGenerator: (c: any) => {
    return (
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"
    );
  },
  handler: (c: any) => {
    throw new TooManyRequestsError(
      "Too many attempts. Please try again after an hour.",
    );
  },
});
