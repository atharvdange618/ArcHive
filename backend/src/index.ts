import { Hono } from "hono";
import { connectDB, disconnectDB } from "./db";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();

// --- Global Middleware ---

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
