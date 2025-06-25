import { Hono } from "hono";
import mongoose from "mongoose";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

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
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

app.use(logger());
app.use(prettyJSON());

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
    const errorResponse: { message: string; errors?: any } = {
      message: err.message,
    };
    if ((err as any).errors) {
      errorResponse.errors = (err as any).errors;
    }
    console.error(`HTTP Error (${err.status}):`, errorResponse);
    return c.json(errorResponse, err.status);
  }
  console.error(`An unexpected server error occurred: ${err.message}`, err);
  return c.json({ message: "An unexpected server error occurred." }, 500);
});

export default app;
