import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { AppError, UnauthorizedError } from "../utils/errors";
import { validate } from "../middleware/validator";
import { checkBlacklist } from "../middleware/auth.middleware";
import { apiRateLimiter, searchRateLimiter } from "../middleware/rateLimiter";

import {
  createContent,
  getContentById,
  getContents,
  updateContent,
  deleteContent,
} from "../services/content.service";
import {
  createContentSchema,
  updateContentSchema,
  searchContentQuerySchema,
  CreateContentInput,
  UpdateContentInput,
  SearchContentQuery,
} from "../validation/content.validation";

/**
 * Defines routes for managing content items in the application.
 *
 * @module contentRoutes
 * @description
 * This module provides RESTful API endpoints for creating, retrieving, updating, and deleting content items.
 * All routes are protected by JWT authentication middleware and validate input using Zod schemas.
 *
 * ## Routes
 * - `POST /api/content` - Create a new content item. Requires a valid request body matching `createContentSchema`.
 * - `GET /api/content` - Retrieve all content items for the authenticated user, with support for search and pagination via query parameters validated by `searchContentQuerySchema`.
 * - `GET /api/content/:id` - Retrieve a single content item by its ID for the authenticated user.
 * - `PUT /api/content/:id` - Update an existing content item by its ID. Requires a valid request body matching `updateContentSchema`.
 * - `DELETE /api/content/:id` - Delete a content item by its ID for the authenticated user.
 *
 * ## Middleware
 * - JWT authentication is enforced for all routes. The user's information is extracted from the JWT payload and attached to the context.
 * - Input validation is performed using Zod schemas for both request bodies and query parameters. Validation errors result in a 400 HTTP response with detailed error messages.
 *
 * ## Error Handling
 * - Throws `HTTPException` with appropriate status codes and messages for authentication failures and validation errors.
 * - Service-level errors are propagated and should be handled by the application's global error handler.
 *
 * @see createContent
 * @see getContents
 * @see getContentById
 * @see updateContent
 * @see deleteContent
 * @see createContentSchema
 * @see updateContentSchema
 * @see searchContentQuerySchema
 */

import { config } from "../config";

const contentRoutes = new Hono();

contentRoutes.use(
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
    });
    await next();
  }
);

// CREATE Content Item (POST /api/content)
contentRoutes.post(
  "/",
  apiRateLimiter,
  validate("json", createContentSchema),
  async (c) => {
    const userId = c.get("user")?._id;
    const data = c.req.valid("json") as CreateContentInput;

    try {
      const newContent = await createContent(userId, data);

      return c.json(
        {
          message: "Content created successfully",
          content: newContent.toObject(),
        },
        201
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, "Internal Server Error");
    }
  }
);

// GET All Content Items with Search & Pagination (GET /api/content)
contentRoutes.get(
  "/",
  searchRateLimiter,
  validate("query", searchContentQuerySchema),
  async (c) => {
    const userId = c.get("user")?._id;
    const queryParams = c.req.valid("query") as SearchContentQuery;

    try {
      const result = await getContents(userId, queryParams);
      return c.json(
        {
          message: "Content items retrieved successfully",
          data: result.contents.map((item) => item.toObject()),
          meta: {
            totalCount: result.totalCount,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
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

// GET Single Content Item by ID (GET /api/content/:id)
contentRoutes.get("/:id", async (c) => {
  const userId = c.get("user")?._id;
  const contentId = c.req.param("id");

  try {
    const content = await getContentById(userId, contentId);
    return c.json(
      {
        message: "Content item retrieved successfully!",
        content: content.toObject(),
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

// UPDATE Content Item (PUT /api/content/:id)
contentRoutes.put(
  "/:id",
  apiRateLimiter,
  validate("json", updateContentSchema),
  async (c) => {
    const userId = c.get("user")?._id;
    const contentId = c.req.param("id");
    const updates = c.req.valid("json") as UpdateContentInput;

    try {
      const updatedContent = await updateContent(userId, contentId, updates);
      return c.json(
        {
          message: "Content item updated successfully!",
          content: updatedContent.toObject(),
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

// DELETE Content Item (DELETE /api/content/:id)
contentRoutes.delete("/:id", apiRateLimiter, async (c) => {
  const userId = c.get("user")?._id;
  const contentId = c.req.param("id");

  try {
    await deleteContent(userId, contentId);
    return c.json(
      {
        message: "Content item deleted successfully!",
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

export default contentRoutes;
