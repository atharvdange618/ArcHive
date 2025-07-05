import { z } from "zod";
import "dotenv/config";

/**
 * Zod schema for validating environment variables.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  OAUTH_REDIRECT_BASE_URL: z
    .string()
    .url("OAUTH_REDIRECT_BASE_URL must be a valid URL")
    .min(1, "OAUTH_REDIRECT_BASE_URL is required"),
  CORS_ORIGINS: z
    .string()
    .min(1, "CORS_ORIGINS is required")
    .transform((val) => {
      return val.split(",").map((origin) => origin.trim());
    }),
});

/**
 * Validates and exports the environment variables.
 * If validation fails, the process will exit with an error.
 */
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error(
    "❌ Invalid environment variables:",
    env.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const config = env.data;
