import { z } from "zod";
import { ContentType } from "../db/models/ContentItem";

const baseContentSchema = z.object({
  title: z
    .string()
    .trim()
    .max(200, "Title cannot exceed 200 characters")
    .optional()
    .nullable()
    .transform((e) => (e === "" ? undefined : e)),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable()
    .transform((e) => (e === "" ? undefined : e)),
  tags: z
    .array(z.string().trim().min(1, "Tag cannot be empty"))
    .transform((arr) => arr.map((tag) => tag.toLowerCase()))
    .optional()
    .default([]),
});

// Schema for Text content type
const textContentSchema = baseContentSchema.extend({
  type: z.literal(ContentType.Text),
  content: z
    .string()
    .trim()
    .min(1, "Text content cannot be empty")
    .max(100000, "Text content cannot exceed 100,000 characters"),
  url: z.never().optional(),
});

// Schema for Link content type
const linkContentSchema = baseContentSchema.extend({
  type: z.literal(ContentType.Link).optional(),
  url: z
    .string()
    .trim()
    .url("Invalid URL format")
    .min(1, "URL cannot be empty"),
  content: z.never().optional(),
});

// Schema for Code content type
const codeContentSchema = baseContentSchema.extend({
  type: z.literal(ContentType.Code),
  content: z
    .string()
    .trim()
    .min(1, "Code content cannot be empty")
    .max(100000, "Code content cannot exceed 100,000 characters"),
  url: z.never().optional(),
});

// Union type for creating new content items
export const createContentSchema = z.discriminatedUnion("type", [
  textContentSchema,
  linkContentSchema,
  codeContentSchema,
]);

// Infer the TypeScript type for creation
export type CreateContentInput = z.infer<typeof createContentSchema>;

export const updateContentSchema = z
  .object({
    type: z
      .literal(ContentType.Text)
      .or(z.literal(ContentType.Link))
      .or(z.literal(ContentType.Code))
      .optional(),
    title: baseContentSchema.shape.title,
    description: baseContentSchema.shape.description,
    tags: baseContentSchema.shape.tags,
    content: z
      .string()
      .trim()
      .min(1)
      .max(100000)
      .optional()
      .nullable()
      .transform((e) => (e === "" ? undefined : e)),
    url: z
      .string()
      .trim()
      .url("Invalid URL format")
      .min(1)
      .optional()
      .nullable()
      .transform((e) => (e === "" ? undefined : e)),
    previewImageUrl: z
      .string()
      .url("Invalid URL for preview image")
      .optional()
      .nullable(),
  })
  .partial();

// Infer the TypeScript type for update
export type UpdateContentInput = z.infer<typeof updateContentSchema>;

// Schema for search query parameters
export const searchContentQuerySchema = z
  .object({
    q: z.string().trim().min(1, "Search query cannot be empty").optional(),
    type: z.nativeEnum(ContentType).optional(),
    tag: z.string().trim().min(1, "Tag cannot be empty").optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
  })
  .partial();

export type SearchContentQuery = z.infer<typeof searchContentQuerySchema>;
