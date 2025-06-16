import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

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

const JWT_SECRET = Bun.env.JWT_SECRET as string;

const contentRoutes = new Hono();

contentRoutes.use("*", jwt({ secret: JWT_SECRET }), async (c, next) => {
  const payload = c.get("jwtPayload");
  if (!payload || !payload._id) {
    throw new HTTPException(401, {
      message: "Invalid or missing JWT payload.",
    });
  }
  c.set("user", {
    _id: payload._id,
    username: payload.username,
    email: payload.email,
  });
  await next();
});

// CREATE Content Item (POST /api/content)
contentRoutes.post(
  "/",
  validator("json", (value, c) => {
    const parsed = createContentSchema.safeParse(value);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw new HTTPException(400, {
        message: `Validation failed for content creation: ${JSON.stringify(
          errors
        )}`,
      });
    }
    return parsed.data;
  }),
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
      throw error;
    }
  }
);

// GET All Content Items with Search & Pagination (GET /api/content)
contentRoutes.get(
  "/",

  validator("query", (value, c) => {
    const parsed = searchContentQuerySchema.safeParse(value);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw new HTTPException(400, {
        message: `Validation failed for search query: ${JSON.stringify(
          errors
        )}`,
      });
    }
    return parsed.data;
  }),
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
      throw error;
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
    throw error;
  }
});

// UPDATE Content Item (PUT /api/content/:id)
contentRoutes.put(
  "/:id",
  validator("json", (value, c) => {
    const parsed = updateContentSchema.safeParse(value);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw new HTTPException(400, {
        message: `Validation failed for content update: ${JSON.stringify(
          errors
        )}`,
      });
    }
    return parsed.data;
  }),
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
      throw error;
    }
  }
);

// DELETE Content Item (DELETE /api/content/:id)
contentRoutes.delete("/:id", async (c) => {
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
    throw error;
  }
});

export default contentRoutes;
