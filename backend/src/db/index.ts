import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * This function reads the MongoDB connection URI from env variables
 *
 * @returns {Promise<void>} A promise that resolves when the connection is successful.,
 * or rejects if an error occurs.
 */

export async function connectDB(): Promise<void> {
  const mongoURI = Bun.env.MONGODB_URI;

  if (!mongoURI) {
    console.error(
      "Error: MONGODB_URI is not defined in environment variables."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("🎉 Connected to MongoDB successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

/**
 * Disconnects from the MongoDB database
 * This function can be called when the application is shutting down
 * @returns {Promise<void>}
 */

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB.");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
  }
}
