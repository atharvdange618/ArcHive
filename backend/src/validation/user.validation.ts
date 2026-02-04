import { z } from "zod";

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required." })
    .max(50, { message: "First name cannot exceed 50 characters." })
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(1, { message: "Last name is required." })
    .max(50, { message: "Last name cannot exceed 50 characters." })
    .optional(),
  profilePictureUrl: z
    .string()
    .trim()
    .url({ message: "Invalid URL." })
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
