import { z } from "zod";
import { validator } from "hono/validator";
import { ValidationError } from "../utils/errors";

/**
 * Creates a Hono middleware for validating request data against a Zod schema.
 *
 * @param target The part of the request to validate ('json', 'query', 'param', 'form', 'header').
 * @param schema The Zod schema to validate against.
 * @returns A Hono middleware handler.
 * @throws {HTTPException} with a 400 status code and structured error details if validation fails.
 */
export const validate = <T extends z.ZodType<any, any, any>>(
  target: "json" | "query" | "param" | "form" | "header",
  schema: T
) => {
  return validator(target, (value, c) => {
    const parsed = schema.safeParse(value);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      throw new ValidationError("Validation failed", { errors });
    }

    return parsed.data;
  });
};
