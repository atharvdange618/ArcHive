import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import {
  registerSchema,
  loginSchema,
  RegisterInput,
  LoginInput,
} from "../validation/auth.validation";
import { registerUser, loginUser } from "../services/auth.service";

/**
 * Defines authentication routes for user registration and login.
 *
 * @module authRoutes
 *
 * @remarks
 * - POST `/register`: Registers a new user. Validates the request body using `registerSchema` (Zod).
 *   Returns a success message, user object, and JWT token on success.
 *   Responds with HTTP 400 and validation errors if input is invalid.
 *
 * - POST `/login`: Authenticates a user. Validates the request body using `loginSchema` (Zod).
 *   Returns a success message, user object, and JWT token on success.
 *   Responds with HTTP 400 and validation errors if input is invalid.
 *
 * @throws {HTTPException} If validation fails or service errors occur.
 *
 * @see registerSchema
 * @see loginSchema
 * @see registerUser
 * @see loginUser
 */

const authRoutes = new Hono();

// Register a new user
authRoutes.post(
  "/register",
  validator("json", (value, c) => {
    const parsed = registerSchema.safeParse(value);
    if (!parsed.success) {
      // format zod errors
      const errors = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw new HTTPException(400, {
        message: `Validation failed: ${JSON.stringify(errors)}`,
      });
    }
    return parsed.data;
  }),
  async (c) => {
    const { username, email, password } = c.req.valid("json") as RegisterInput;

    try {
      const { user, token } = await registerUser({ username, email, password });

      return c.json({ message: "Registration successful!", user, token }, 201);
    } catch (error) {
      throw error;
    }
  }
);

// User Login
authRoutes.post(
  "/login",
  validator("json", (value, c) => {
    const parsed = loginSchema.safeParse(value);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw new HTTPException(400, {
        message: `Validation failed: ${JSON.stringify(errors)}`,
      });
    }
    return parsed.data; // Return the validated data
  }),
  async (c) => {
    const { email, password } = c.req.valid("json") as LoginInput;

    try {
      const { user, token } = await loginUser({ email, password });

      return c.json({ message: "Login successful!", user, token }, 200);
    } catch (error) {
      throw error;
    }
  }
);

export default authRoutes;
