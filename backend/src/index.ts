import { Hono } from "hono";
import { connectDB, disconnectDB } from "./db";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

// --- Global Middleware ---

// CORS Middleware
app.use(
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600, // Preflight request cache max age
  })
);

// Logger middleware: Logs requests to the console
app.use(logger());

// prettyJSON middleware: Formats JSON responses nicely in the browser
app.use(prettyJSON());

// --- Routes ---

// Basic root route
app.get("/", (c) => {
  return c.json({ message: "Hello from Hono! Backend is running." });
});

// A simple health check endpoint
app.get("/health", (c) => {
  return c.text("OK");
});

// Auth routes
app.route("/api/auth", authRoutes);

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

(async () => {
  // connect to db first
  await connectDB();

  // get the port from env or default to 3000
  const port = parseInt(Bun.env.PORT || "3000", 10);

  console.log(`Server starting on http://localhost:${port}`);

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    await disconnectDB();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Shutting down server...");
    await disconnectDB();
    process.exit(0);
  });
})();

export default app;
