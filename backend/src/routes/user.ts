import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { AppError, BadRequestError, UnauthorizedError } from "../utils/errors";
import { validate } from "../middleware/validator";
import { checkBlacklist } from "../middleware/auth.middleware";
import { apiRateLimiter } from "../middleware/rateLimiter";
import {
  updateUserProfile,
  updateUserProfilePicture,
} from "../services/user.service";
import { getUserStats } from "../services/stats.service";
import {
  updateUserSchema,
  UpdateUserInput,
} from "../validation/user.validation";
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

userRoutes.put("/profile-picture", apiRateLimiter, async (c) => {
  const userId = c.get("user")?._id;
  const body = await c.req.parseBody();
  const file = body["profilePicture"] as File;

  if (!file) {
    throw new BadRequestError("No file uploaded.");
  }

  try {
    const updatedUser = await updateUserProfilePicture(userId, file);
    return c.json(
      {
        message: "Profile picture updated successfully",
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
});

userRoutes.get("/profile", apiRateLimiter, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

userRoutes.get("/stats", apiRateLimiter, async (c) => {
  const userId = c.get("user")?._id;

  try {
    const stats = await getUserStats(userId);
    return c.json({ stats }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "Internal Server Error");
  }
});

export default userRoutes;
