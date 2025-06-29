import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import BlacklistedToken from "../db/models/BlacklistedToken";

/**
 * Middleware to check if the provided JWT token is blacklisted.
 *
 * This middleware extracts the token from the `Authorization` header of the request.
 * If a token is present, it queries the `BlacklistedToken` model to determine if the token
 * has been blacklisted. If the token is found in the blacklist, an HTTP 401 Unauthorized
 * exception is thrown. Otherwise, the request proceeds to the next middleware or handler.
 *
 * @param c - The Hono context object.
 * @param next - The next middleware function in the stack.
 * @throws {HTTPException} Throws a 401 Unauthorized error if the token is blacklisted.
 */

export const checkBlacklist: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (token) {
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      throw new HTTPException(401, { message: "Token is invalid." });
    }
  }

  await next();
};
