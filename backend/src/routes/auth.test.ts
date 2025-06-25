import { test, expect } from "vitest";
import app from "../index";

test("POST /api/auth/login", async () => {
  const req = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "test@example.com",
      password: "Hello@6184",
    }),
  });

  const res = await app.fetch(req);

  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data).toHaveProperty("token");
});
