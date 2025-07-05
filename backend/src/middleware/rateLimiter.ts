import { rateLimiter } from "hono-rate-limiter";
import { HTTPException } from "hono/http-exception";
import { MiddlewareHandler } from "hono";
import { config } from "../config";

/**
 * Rate limiting configurations for different endpoint types
 */

// Helper to bypass rate limiting in test environment
const createRateLimiter = (options: any): MiddlewareHandler => {
  if (config.NODE_ENV === "test") {
    // Return a no-op middleware in test environment
    return async (c, next) => await next();
  }
  return rateLimiter(options);
};

// Strict rate limit for authentication endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: "draft-6",
  keyGenerator: (c: any) => {
    return (
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"
    );
  },
  handler: (c: any) => {
    throw new HTTPException(429, {
      message: "Too many authentication attempts. Please try again later.",
    });
  },
});

// Moderate rate limit for general API endpoints
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: "draft-6",
  keyGenerator: (c: any) => {
    const user = c.get("user");
    const ip =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    return user ? `${user._id}-${ip}` : ip;
  },
  handler: (c: any) => {
    throw new HTTPException(429, {
      message: "Too many requests. Please slow down.",
    });
  },
});

// Higher rate limit for search/read operations
export const searchRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: "draft-6",
  keyGenerator: (c: any) => {
    const user = c.get("user");
    const ip =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    return user ? `${user._id}-${ip}` : ip;
  },
  handler: (c: any) => {
    throw new HTTPException(429, {
      message: "Too many search requests. Please slow down.",
    });
  },
});

// Very strict rate limit for password reset or sensitive operations
export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // Limit each IP to 3 requests per hour
  standardHeaders: "draft-6",
  keyGenerator: (c: any) => {
    return (
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown"
    );
  },
  handler: (c: any) => {
    throw new HTTPException(429, {
      message: "Too many attempts. Please try again after an hour.",
    });
  },
});
