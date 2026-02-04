import ContentItem, { IContentItem } from "../db/models/ContentItem";
import { AppError, ValidationError, NotFoundError } from "../utils/errors";
import { parseUrl } from "../parsers";
// import { screenshotQueue, tagQueue } from "../config/bullmq";
import {
  CreateContentInput,
  UpdateContentInput,
  SearchContentQuery,
} from "../validation/content.validation";
import mongoose from "mongoose";
import { HTTPException } from "hono/http-exception";
import natural from "natural";
import { generateTagsFromUrl } from "src/utils/generateTagsFromUrl";
import { screenshotQueue, tagQueue } from "src/config/bullmq";

/**
 * Creates a new content item for a specific user.
 * @param userId The ID of the authenticated user.
 * @param data The validated input data for the new content item.
 * @returns The newly created content item document.
 * @throws HTTPException if creation fails.
 */
async function createContent(
  userId: string,
  data: CreateContentInput,
): Promise<IContentItem> {
  try {
    let finalData: any = { ...data };

    if (data.url) {
      const parsedData = await parseUrl(data.url);
      const tags = await generateTagsFromUrl(data.url);
      finalData = { ...finalData, ...parsedData, tags };
    }

    const newContent = new ContentItem({
      ...finalData,
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Enqueue screenshot and tag generation jobs
    if (newContent.url) {
      screenshotQueue
        .add("screenshot-queue", {
          contentId: newContent._id,
          url: newContent.url,
          userId: userId,
        })
        .catch((err) =>
          console.error("Failed to enqueue screenshot job", {
            contentId: newContent._id,
            error: err,
          }),
        );

      tagQueue
        .add("generate-tags", {
          contentId: newContent._id,
          url: newContent.url,
        })
        .catch((err) =>
          console.error("Failed to enqueue tag generation job", {
            contentId: newContent._id,
            error: err,
          }),
        );
    }

    await newContent.save();

    return newContent;
  } catch (error) {
    console.error("Error creating content:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ValidationError("Validation failed", error.errors);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "Failed to create content item.");
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
  contentId: string,
): Promise<IContentItem> {
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new ValidationError("Invalid content ID format.");
  }
  try {
    const content = await ContentItem.findOne({
      _id: contentId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!content) {
      throw new NotFoundError(
        "Content item not found or you do not have access.",
      );
    }
    return content;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error(
      `Error getting content item ${contentId} for user ${userId}:`,
      error,
    );
    throw new AppError(500, "Failed to retrieve content item.");
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

  const findCriteria: mongoose.FilterQuery<IContentItem> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (q) {
    const searchRegex = new RegExp(q, "i"); // Case-insensitive regex search
    findCriteria.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { content: searchRegex },
      { url: searchRegex },
      { tags: searchRegex },
    ];
  }

  if (type) {
    findCriteria.type = type;
  }

  if (tag) {
    const stemmedTag = natural.PorterStemmer.stem(tag.toLowerCase());
    findCriteria.tags = { $in: [stemmedTag] };
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
        query,
      )}:`,
      error,
    );
    throw new AppError(500, "Failed to retrieve content item.");
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
  updates: UpdateContentInput,
): Promise<IContentItem> {
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    throw new ValidationError("Invalid content ID format.");
  }

  // Prevent changing content type after creation
  if (updates.type) {
    const existing = await ContentItem.findOne({
      _id: contentId,
      userId: new mongoose.Types.ObjectId(userId),
    }).select("type");

    if (existing && existing.type !== updates.type) {
      throw new ValidationError(
        `Content type cannot be changed. Expected ${existing.type}, got ${updates.type}.`,
      );
    }
  }

  try {
    const updatedContent = await ContentItem.findOneAndUpdate(
      {
        _id: contentId,
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!updatedContent) {
      throw new NotFoundError(
        "Content item not found or you do not have access to update it.",
      );
    }

    return updatedContent;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ValidationError("Validation failed", error.errors);
    }
    console.error(
      `Error updating content item ${contentId} for user ${userId}:`,
      error,
    );
    throw new AppError(500, "Failed to update content item.");
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
    throw new ValidationError("Invalid content ID format.");
  }

  try {
    const result = await ContentItem.deleteOne({
      _id: contentId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError(
        "Content item not found or you do not have access to delete it.",
      );
    }
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error(
      `Error deleting content item ${contentId} for user ${userId}:`,
      error,
    );
    throw new AppError(500, "Failed to delete content item.");
  }
}

export {
  createContent,
  getContentById,
  getContents,
  updateContent,
  deleteContent,
};
