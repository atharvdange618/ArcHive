import ContentItem, { IContentItem } from "../db/models/ContentItem";
import { HTTPException } from "hono/http-exception";
import {
  CreateContentInput,
  UpdateContentInput,
  SearchContentQuery,
} from "../validation/content.validation";
import mongoose from "mongoose";

/**
 * Creates a new content item for a specific user.
 * @param userId The ID of the authenticated user.
 * @param data The validated input data for the new content item.
 * @returns The newly created content item document.
 * @throws HTTPException if creation fails.
 */
async function createContent(
  userId: string,
  data: CreateContentInput
): Promise<IContentItem> {
  try {
    const newContent = new ContentItem({
      ...data,
      userId: new mongoose.Types.ObjectId(userId),
    });

    await newContent.save();
    return newContent;
  } catch (error) {
    console.error("Error creating content:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      throw new HTTPException(400, {
        message: `Validation failed: ${error.message}`,
      });
    }
    throw new HTTPException(500, { message: "Failed to create content item." });
  }
}

/**
 * Retrieves a single content item by its ID for a specific user.
 * Ensures the user owns the content item.
 * @param userId The ID of the authenticated user.
 * @param contentId The ID of the content item to retrieve.
 * @returns The content item document.
 * @throws HTTPException if content not found or user unauthorized.
 */
async function getContentById(
  userId: string,
  contentId: string
): Promise<IContentItem> {
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new HTTPException(400, { message: "Invalid content ID format." });
  }
  try {
    const content = await ContentItem.findOne({
      _id: contentId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!content) {
      throw new HTTPException(404, {
        message: "Content item not found or you do not have access.",
      });
    }
    return content;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error(
      `Error getting content item ${contentId} for user ${userId}:`,
      error
    );
    throw new HTTPException(500, {
      message: "Failed to retrieve content item.",
    });
  }
}

/**
 * Retrieves all content items for a specific user, with optional search and pagination.
 * @param userId The ID of the authenticated user.
 * @param query The validated search and pagination query parameters.
 * @returns An array of content item documents and total count.
 * @throws HTTPException if retrieval fails.
 */
async function getContents(userId: string, query: SearchContentQuery) {
  const { q, type, tag, limit = 20, page = 1 } = query;

  const findCriteria: any = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (q) {
    // for full-text search using the text index
    findCriteria.$text = { $search: q };
  }
  if (type) {
    findCriteria.type = type;
  }
  if (tag) {
    findCriteria.tags = tag;
  }

  try {
    // count total documents matching the criteria (for pagination metadata)
    const totalCount = await ContentItem.countDocuments(findCriteria);

    // calculatie skip for pagination
    const skip = (page - 1) * limit;

    let contentsQuery = ContentItem.find(findCriteria)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // If a text search query is present, sort by text score for relevance
    if (q) {
      contentsQuery = contentsQuery.sort({
        score: { $meta: "textScore" },
        createdAt: -1,
      });
    } else {
      // Default sort by creation date if no text search
      contentsQuery = contentsQuery.sort({ createdAt: -1 });
    }

    const contents = await contentsQuery.exec();

    return {
      contents,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error(
      `Error getting content items for user ${userId} with query ${JSON.stringify(
        query
      )}:`,
      error
    );
    throw new HTTPException(500, {
      message: "Failed to retrieve content items.",
    });
  }
}

/**
 * Updates an existing content item for a specific user.
 * Ensures the user owns the content item and handles type-specific updates.
 * @param userId The ID of the authenticated user.
 * @param contentId The ID of the content item to update.
 * @param updates The validated update data.
 * @returns The updated content item document.
 * @throws HTTPException if content not found, user unauthorized, or update fails.
 */
async function updateContent(
  userId: string,
  contentId: string,
  updates: UpdateContentInput
): Promise<IContentItem> {
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new HTTPException(400, { message: "Invalid content ID format." });
  }

  // Prevent changing content type after creation
  if (updates.type) {
    const existing = await ContentItem.findOne({
      _id: contentId,
      userId: new mongoose.Types.ObjectId(userId),
    }).select("type");

    if (existing && existing.type !== updates.type) {
      throw new HTTPException(400, {
        message: `Content type cannot be changed. Expected ${existing.type}, got ${updates.type}.`,
      });
    }
  }

  try {
    const updatedContent = await ContentItem.findOneAndUpdate(
      {
        _id: contentId,
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedContent) {
      throw new HTTPException(404, {
        message:
          "Content item not found or you do not have access to update it.",
      });
    }

    return updatedContent;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    if (error instanceof mongoose.Error.ValidationError) {
      throw new HTTPException(400, {
        message: `Validation failed: ${error.message}`,
      });
    }
    console.error(
      `Error updating content item ${contentId} for user ${userId}:`,
      error
    );
    throw new HTTPException(500, { message: "Failed to update content item." });
  }
}

/**
 * Deletes a content item for a specific user.
 * Ensures the user owns the content item.
 * @param userId The ID of the authenticated user.
 * @param contentId The ID of the content item to delete.
 * @throws HTTPException if content not found, user unauthorized, or deletion fails.
 */
async function deleteContent(userId: string, contentId: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new HTTPException(400, { message: "Invalid content ID format." });
  }

  try {
    const result = await ContentItem.deleteOne({
      _id: contentId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new HTTPException(404, {
        message:
          "Content item not found or you do not have access to delete it.",
      });
    }
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error(
      `Error deleting content item ${contentId} for user ${userId}:`,
      error
    );
    throw new HTTPException(500, { message: "Failed to delete content item." });
  }
}

export {
  createContent,
  getContentById,
  getContents,
  updateContent,
  deleteContent,
};
