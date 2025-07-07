import { test, expect, beforeAll, beforeEach, describe } from "vitest";
import app from "../app";
import { handle } from "hono/vercel";
import User from "../db/models/User";
import ContentItem from "../db/models/ContentItem";
import { Types } from "mongoose";

const handler = handle(app);

const getAuthToken = async (
  usernamePrefix = "testuser",
  emailPrefix = "test",
  password = "Password123!"
): Promise<{ accessToken: string; email: string }> => {
  const uniqueId = Date.now();
  const username = `${usernamePrefix}_${uniqueId}`;
  const email = `${emailPrefix}_${uniqueId}@example.com`;

  await User.deleteOne({ email });

  const registerReq = new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const registerRes = await handler(registerReq);
  expect(registerRes.status).toBe(201);

  const loginReq = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginRes = await handler(loginReq);
  expect(loginRes.status).toBe(200);

  const loginData = (await loginRes.json()) as { accessToken: string };
  return { accessToken: loginData.accessToken, email };
};

let authToken: string;
let userId: string;
let testEmail: string;

beforeAll(async () => {
  const result = await getAuthToken("contentuser", "contentuser");
  authToken = result.accessToken;
  testEmail = result.email;
  const user = await User.findOne({ email: testEmail });
  userId = (user!._id as Types.ObjectId).toString();
});

beforeEach(async () => {
  await ContentItem.deleteMany({});
});
// --- Content API Tests ---

describe("Content Creation", () => {
  test("POST /api/content - success", async () => {
    const newContent = {
      type: "text",
      title: "Test Title",
      content: "Test content",
      tags: ["tag"],
    };

    const req = new Request("http://localhost/api/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(newContent),
    });
    const res = await handler(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.content).toMatchObject({ title: newContent.title });
  });

  test("POST /api/content - fails with missing content", async () => {
    const req = new Request("http://localhost/api/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ type: "text" }),
    });
    const res = await handler(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("Validation failed");
  });

  test("POST /api/content - fails without auth", async () => {
    const req = new Request("http://localhost/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", title: "No auth", content: "No" }),
    });
    const res = await handler(req);

    expect(res.status).toBe(401);
  });
});

describe("Content Retrieval", () => {
  test("GET /api/content - retrieves all items", async () => {
    await ContentItem.insertMany([
      { userId, type: "text", title: "Item1", content: "1", tags: ["tag1"] },
      { userId, type: "text", title: "Item2", content: "2", tags: ["tag2"] },
    ]);

    const req = new Request("http://localhost/api/content", {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await handler(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.length).toBe(2);
  });

  test("GET /api/content - filters by search, tag, and type", async () => {
    await ContentItem.insertMany([
      { userId, type: "text", title: "Note A", content: "abc", tags: ["dev"] },
      {
        userId,
        type: "text",
        title: "Note B",
        content: "bcd",
        tags: ["design"],
      },
      {
        userId,
        type: "code",
        title: "Code Snippet",
        content: "console.log()",
        tags: ["dev"],
      },
    ]);

    const req = new Request(
      `http://localhost/api/content?q=note&type=text&tag=dev`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    const res = await handler(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.length).toBe(1);
    expect(data.data[0].title).toBe("Note A");
  });

  test("GET /api/content/:id - retrieves one item", async () => {
    const item = await ContentItem.create({
      userId,
      type: "text",
      title: "Single",
      content: "One",
      tags: [],
    });

    const req = new Request(`http://localhost/api/content/${item._id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await handler(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content.title).toBe("Single");
  });
});

describe("Content Update", () => {
  test("PUT /api/content/:id - success", async () => {
    const item = await ContentItem.create({
      userId,
      type: "text",
      title: "Old",
      content: "Old",
      tags: [],
    });

    const req = new Request(`http://localhost/api/content/${item._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title: "Updated" }),
    });
    const res = await handler(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content.title).toBe("Updated");
  });

  test("PUT /api/content/:id - fails with invalid type", async () => {
    const item = await ContentItem.create({
      userId,
      type: "text",
      title: "Old",
      content: "Old",
      tags: [],
    });

    const req = new Request(`http://localhost/api/content/${item._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ type: "image" }),
    });
    const res = await handler(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("Validation failed");
  });
});

describe("Content Deletion", () => {
  test("DELETE /api/content/:id - deletes item", async () => {
    const item = await ContentItem.create({
      userId,
      type: "text",
      title: "To Delete",
      content: "Bye",
      tags: [],
    });

    const req = new Request(`http://localhost/api/content/${item._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await handler(req);

    expect(res.status).toBe(200);
    const deleted = await ContentItem.findById(item._id);
    expect(deleted).toBeNull();
  });
});

describe("Edge Cases", () => {
  test("JWT malformed or expired token", async () => {
    const req = new Request("http://localhost/api/content", {
      method: "GET",
      headers: {
        Authorization: `Bearer invalid.token.here`,
      },
    });
    const res = await handler(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.message).toContain("Unauthorized");
  });

  test("XSS attempt is stored as plain text", async () => {
    const maliciousContent = {
      type: "text",
      title: "<script>alert(1)</script>",
      content: "<img src='x' onerror='alert(1)' />",
    };
    const req = new Request("http://localhost/api/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(maliciousContent),
    });
    const res = await handler(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.content.title).toBe(maliciousContent.title);
    expect(data.content.content).toBe(maliciousContent.content);
  });
});
