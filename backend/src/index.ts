import { config } from "./config";
import app from "./app";
import { connectDB, disconnectDB } from "./db";

(async () => {
  // Connect to DB once when the server starts
  await connectDB();

  const port = config.PORT;

  Bun.serve({
    fetch: app.fetch,
    port: port,
  });

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
