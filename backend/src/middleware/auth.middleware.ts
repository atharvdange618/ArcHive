import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import BlacklistedToken from "../db/models/BlacklistedToken";

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
