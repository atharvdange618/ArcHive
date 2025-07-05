import { Hono } from "hono";
import mongoose from "mongoose";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { bodyLimit } from "hono/body-limit";

import { config } from "./config";
import { AuthUserData } from "./services/auth.service";
import authRoutes from "./routes/auth";
import contentRoutes from "./routes/content";

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUserData;
  }
}

const app = new Hono();

// --- Global Middleware ---
app.use(
  cors({
    origin: (origin, c) => {
      if (!origin) return "*";

      const allowedOrigins = config.CORS_ORIGINS;
      if (allowedOrigins.includes(origin)) {
        return origin;
      }

      if (
        config.NODE_ENV === "development" &&
        (origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:"))
      ) {
        return origin;
      }

      return null;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.use(logger());
app.use(prettyJSON());

app.use(
  bodyLimit({
    maxSize: 1 * 1024 * 1024, // 1MB
    onError: (c) => {
      throw new HTTPException(413, {
        message: "Request body too large. Maximum size is 1MB.",
      });
    },
  })
);

// --- Routes ---
app.get("/", (c) => {
  return c.json({ message: "Hello from Hono! Backend is running." });
});

app.get("/health", (c) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  return c.json({
    status: "ok",
    dbConnected: isDbConnected,
  });
});

app.route("/api/auth", authRoutes);
app.route("/api/content", contentRoutes);

// --- Custom Error Handling for HTTPExceptions ---
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const errorResponse: { message: string; errors?: any; cause?: any } = {
      message: err.message,
    };
    if (err.cause) {
      errorResponse.cause = err.cause;
    }
    return c.json(errorResponse, err.status);
  }
  console.error(`An unexpected server error occurred: ${err.message}`, err);
  return c.json({ message: "An unexpected server error occurred." }, 500);
});

export default app;
