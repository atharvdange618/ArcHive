import { config } from "./config";
import app from "./app";
import { connectDB, disconnectDB } from "./db";

(async () => {
  await connectDB();

  const port = config.PORT;

  Bun.serve({
    fetch: app.fetch,
    hostname:"0.0.0.0",
    port: port,
  });

  console.log(`Server starting on http://localhost:${port}`);

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
