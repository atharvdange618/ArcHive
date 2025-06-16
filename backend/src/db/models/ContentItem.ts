import mongoose, { Schema, Document, Types } from "mongoose";

// Enum for content types
export enum ContentType {
  Text = "text",
  Link = "link",
  Code = "code",
}

export interface IContentItem extends Document {
  userId: Types.ObjectId; // Reference to the user who created the content
  type: ContentType; // Type of content (text, link, code)
  title?: string; // Optional title for the content
  description?: string; // Optional description for the content
  content: string; // The actual content (text, link URL, or code)
  url?: string; // URL for link items
  tags: string[]; // Array of string tags for organization and search
  previewImageUrl?: string; // Optional URL for a generated link preview image
  createdAt: Date;
  updatedAt: Date;
}

const ContentItemSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ContentType),
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    content: {
      type: String, // For text notes and code snippets
      trim: true,
      maxlength: [100000, "Content cannot exceed 100,000 characters"],
    },
    url: {
      type: String, // For link items
      trim: true,
      match: [/^(https?:\/\/[^\s$.?#].[^\s]*)$/i, "Please enter a valid URL"],
    },
    tags: {
      type: [String],
      default: [],
      set: (v: string[]) =>
        v
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0),
    },
    previewImageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// --- MongoDB Text Index for Search ---
ContentItemSchema.index(
  {
    title: "text",
    description: "text",
    content: "text",
    url: "text",
    tags: "text",
  },
  {
    name: "ContentItemTextIndex",
    weights: {
      title: 10, // Higher weight for title matches
      tags: 5, // Medium weight for tag matches
      description: 3, // Lower weight for description
      content: 1, // Lowest weight for full content
      url: 1, // URL matches
    },
  }
);

const ContentItem = mongoose.model<IContentItem>(
  "ContentItem",
  ContentItemSchema
);

export default ContentItem;
