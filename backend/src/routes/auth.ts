import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validate } from "../middleware/validator";
import {
  registerSchema,
  loginSchema,
  RegisterInput,
  LoginInput,
} from "../validation/auth.validation";
import {
  refreshTokenSchema,
  RefreshTokenInput,
} from "../validation/token.validation";
import { logoutSchema, LogoutInput } from "../validation/logout.validation";
import {
  registerUser,
  loginUser,
  OAuthHandler,
  refreshAccessToken,
  logoutUser,
} from "../services/auth.service";
import { config } from "src/config";
import { jwt } from "hono/jwt";

const authRoutes = new Hono();

/**
 * Defines authentication-related routes for user registration, login, OAuth, token refresh, and logout.
 *
 * @module authRoutes
 *
 * @remarks
 * It includes middleware for validation and JWT authentication, and delegates business logic to service functions.
 *
 * @routes
 * - POST /register: Register a new user.
 * - POST /login: Authenticate a user and issue tokens.
 * - GET /google: Initiate Google OAuth flow.
 * - GET /google/callback: Handle Google OAuth callback.
 * - POST /refresh: Refresh access token using a refresh token.
 * - POST /logout: Log out a user and invalidate tokens.
 *
 * @see {@link registerUser}
 * @see {@link loginUser}
 * @see {@link OAuthHandler}
 * @see {@link refreshAccessToken}
 * @see {@link logoutUser}
 */

// Register a new user
authRoutes.post("/register", validate("json", registerSchema), async (c) => {
  const { username, email, password } = c.req.valid("json") as RegisterInput;

  try {
    const { user, accessToken, refreshToken } = await registerUser({
      username,
      email,
      password,
    });

    return c.json(
      { message: "Registration successful!", user, accessToken, refreshToken },
      201
    );
  } catch (error) {
    throw error;
  }
});

// User Login
authRoutes.post("/login", validate("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json") as LoginInput;

  try {
    const { user, accessToken, refreshToken } = await loginUser({
      email,
      password,
    });

    return c.json(
      { message: "Login successful!", user, accessToken, refreshToken },
      200
    );
  } catch (error) {
    throw error;
  }
});

// Google OAuth
authRoutes.get("/google", (c) => {
  const redirectUri = encodeURIComponent(
    "http://localhost:3000/api/auth/google/callback"
  );
  const clientId = config.GOOGLE_CLIENT_ID;
  const scope = encodeURIComponent("openid profile email");

  const appRedirectPrefix = c.req.query("appRedirectPrefix");

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

  return c.redirect(url);
});

// Google OAuth callback
authRoutes.get("/google/callback", OAuthHandler);

// Refresh Access Token
authRoutes.post("/refresh", validate("json", refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid("json") as RefreshTokenInput;

  try {
    const { accessToken } = await refreshAccessToken(refreshToken);
    return c.json({ message: "Token refreshed successfully!", accessToken });
  } catch (error) {
    throw error;
  }
});

// User Logout
authRoutes.post(
  "/logout",
  jwt({ secret: config.JWT_SECRET }),
  validate("json", logoutSchema),
  async (c) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.split(" ")[1];
    const { refreshToken } = c.req.valid("json") as LogoutInput;

    if (!token) {
      throw new HTTPException(401, { message: "Access token not provided." });
    }

    try {
      await logoutUser(token, refreshToken);
      return c.json({ message: "Logout successful." });
    } catch (error) {
      throw error;
    }
  }
);

export default authRoutes;
