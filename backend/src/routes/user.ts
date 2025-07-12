import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { AppError, UnauthorizedError } from "../utils/errors";
import { validate } from "../middleware/validator";
import { checkBlacklist } from "../middleware/auth.middleware";
import { apiRateLimiter } from "../middleware/rateLimiter";
import { updateUserProfile } from "../services/user.service";
import { updateUserSchema, UpdateUserInput } from "../validation/user.validation";
import { config } from "../config";

const userRoutes = new Hono();

userRoutes.use(
  "*",
  jwt({ secret: config.JWT_SECRET }),
  checkBlacklist,
  async (c, next) => {
    const payload = c.get("jwtPayload");
    if (!payload || !payload._id) {
      throw new UnauthorizedError("Invalid or missing JWT payload.");
    }
    c.set("user", {
      _id: payload._id,
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      profilePictureUrl: payload.profilePictureUrl,
    });
    await next();
  }
);

userRoutes.put(
  "/profile",
  apiRateLimiter,
  validate("json", updateUserSchema),
  async (c) => {
    const userId = c.get("user")?._id;
    const data = c.req.valid("json") as UpdateUserInput;

    try {
      const updatedUser = await updateUserProfile(userId, data);

      return c.json(
        {
          message: "Profile updated successfully",
          user: updatedUser,
        },
        200
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, "Internal Server Error");
    }
  }
);

export default userRoutes;
