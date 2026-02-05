import mongoose, { Schema, Document, Types } from "mongoose";

export enum ContentType {
  Text = "text",
  Link = "link",
  Code = "code",
}

export interface IContentItem extends Document {
  userId: Types.ObjectId;
  type: ContentType;
  title?: string;
  description?: string;
  content: string;
  url?: string;
  tags: string[];
  previewImageUrl?: string;
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
      type: String,
      trim: true,
      maxlength: [100000, "Content cannot exceed 100,000 characters"],
    },
    url: {
      type: String,
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
  },
);

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
      title: 10,
      tags: 5,
      description: 3,
      content: 1,
      url: 1,
    },
  },
);

const ContentItem = mongoose.model<IContentItem>(
  "ContentItem",
  ContentItemSchema,
);

export default ContentItem;
