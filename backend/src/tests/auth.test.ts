import { test, expect } from "vitest";
import app from "../app";
import { handle } from "hono/vercel";
import User from "../db/models/User";

const handler = handle(app);

// --- Auth tests

test("Auth: POST /api/auth/register - Successfully registers a new user", async () => {
  const req = new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "testuser",
      email: "register@example.com",
      password: "StrongPassword@123",
    }),
  });

  const res = await handler(req);

  expect(res.status).toBe(201);
  const data = await res.json();

  expect(data).toHaveProperty("message", "Registration successful!");
  expect(data).toHaveProperty("user");
  expect(data.user).toHaveProperty("username", "testuser");
  expect(data.user).toHaveProperty("email", "register@example.com");
  expect(data.user).toHaveProperty("_id");
  expect(data).toHaveProperty("token");

  // Verify if the user exists in the db
  const userInDb = await User.findOne({ email: "register@example.com" });
  expect(userInDb).not.toBeNull();
  expect(userInDb?.username).toBe("testuser");
});
