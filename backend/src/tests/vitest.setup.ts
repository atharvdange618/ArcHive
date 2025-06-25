import "dotenv/config";
import { connectDB, disconnectDB } from "../db";
import User from "../db/models/User";

beforeAll(async () => {
  console.log("Vitest setup: Connecting to DB...");
  process.env.MONGODB_URI = process.env.MONGODB_URI_TEST;
  await connectDB();
  console.log("Vitest setup: DB connected.");
});

beforeEach(async () => {
  console.log("Vitest beforeEach: Cleaning User collection...");
  await User.deleteMany({});
  console.log("Vitest beforeEach: User collection cleaned.");
});

afterAll(async () => {
  console.log("Vitest setup: Disconnecting from DB...");
  await disconnectDB();
  console.log("Vitest setup: DB disconnected.");
});
