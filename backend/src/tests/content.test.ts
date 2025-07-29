import { test, expect, beforeAll, beforeEach, describe } from "vitest";
import app from "../app";
import { handle } from "hono/vercel";
import User from "../db/models/User";
import ContentItem from "../db/models/ContentItem";

const handler = handle(app);

const getAuthToken = async (
  emailPrefix = "test",
  password = "Password123!",
  firstName = "Test",
  lastName = "User"
): Promise<{ accessToken: string; email: string; userId: string }> => {
  const uniqueId = Date.now();
  const email = `${emailPrefix}_${uniqueId}@example.com`;

  await User.deleteOne({ email });

  const registerReq = new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
  const registerRes = await handler(registerReq);
  const registerData = (await registerRes.json()) as { user: { _id: string } };
  if (registerRes.status === 201) {
    registerData = (await registerRes.json()) as { user: { _id: string } };
  } else if (registerRes.status === 409) {
    // User already exists, proceed to login
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new Error("User not found after 409 registration status.");
    }
    registerData = { user: { _id: existingUser._id.toString() } };
  } else {
    throw new Error(`Unexpected registration status: ${registerRes.status}`);
  }

  const loginReq = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginRes = await handler(loginReq);
  expect(loginRes.status).toBe(200);

  const loginData = (await loginRes.json()) as { accessToken: string };
  return { accessToken: loginData.accessToken, email, userId: registerData.user._id };
};

let authToken: string;
let userId: string;
let testEmail: string;
let otherAuthToken: string;
let otherUserId: string;

beforeAll(async () => {
  const result1 = await getAuthToken("contentuser", "Password123!", "Test", "User");
  authToken = result1.accessToken;
  testEmail = result1.email;
  userId = result1.userId;

  const result2 = await getAuthToken("otheruser", "Password123!", "Other", "User");
  otherAuthToken = result2.accessToken;
  otherUserId = result2.userId;
});

beforeEach(async () => {
  await ContentItem.deleteMany({});
});
// --- Content API Tests ---

describe("Content Creation", () => {
  test("POST /api/content - success for 'text' type", async () => {
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

  test("POST /api/content - success for 'link' type with URL parsing", async () => {
    const newContent = {
      type: "link",
      url: "https://github.com/facebook/react",
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
    expect(data.content.url).toBe(newContent.url);
    expect(data.content.title).toContain("React"); // Title should be parsed
    expect(data.content.tags.length).toBeGreaterThan(0); // Tags should be generated
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
  beforeEach(async () => {
    await ContentItem.insertMany([
      { userId, type: "text", title: "Note A", content: "abc", tags: ["dev", "testing"] },
      { userId, type: "text", title: "Note B", content: "bcd", tags: ["design"] },
      { userId, type: "code", title: "Code Snippet", content: "console.log()", tags: ["dev", "javascript"] },
      { userId: otherUserId, type: "text", title: "Other User's Note", content: "secret", tags: ["private"] },
    ]);
  });

  test("GET /api/content - retrieves all items for the authenticated user only", async () => {
    const req = new Request("http://localhost/api/content", {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await handler(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data.length).toBe(3);
    expect(data.data.some((item: any) => item.title === "Other User's Note")).toBe(false);
  });

  test("GET /api/content - filters by case-insensitive search query", async () => {
    const req = new Request(`http://localhost/api/content?q=note`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.length).toBe(2);
  });

  test("GET /api/content - filters by stemmed tag", async () => {
    const req = new Request(`http://localhost/api/content?tag=tests`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await handler(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.length).toBe(1);
    expect(data.data[0].title).toBe("Note A");
  });

  test("GET /api/content - handles pagination correctly", async () => {
    // Page 1
    const req1 = new Request(`http://localhost/api/content?limit=2&page=1`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res1 = await handler(req1);
    const data1 = await res1.json();
    expect(res1.status).toBe(200);
    expect(data1.data.length).toBe(2);
    expect(data1.meta.page).toBe(1);
    expect(data1.meta.totalPages).toBe(2);

    // Page 2
    const req2 = new Request(`http://localhost/api/content?limit=2&page=2`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res2 = await handler(req2);
    const data2 = await res2.json();
    expect(res2.status).toBe(200);
    expect(data2.data.length).toBe(1);
    expect(data2.meta.page).toBe(2);
  });

  test("GET /api/content/:id - retrieves one item", async () => {
    const item = await ContentItem.create({ userId, type: "text", title: "Single", content: "One" });
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
    const item = await ContentItem.create({ userId, type: "text", title: "Old", content: "Old" });
    const req = new Request(`http://localhost/api/content/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ title: "Updated" }),
    });
    const res = await handler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content.title).toBe("Updated");
  });

  test("PUT /api/content/:id - fails when trying to change content type", async () => {
    const item = await ContentItem.create({ userId, type: "text", title: "Old", content: "Old" });
    const req = new Request(`http://localhost/api/content/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ type: "code" }),
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("Content type cannot be changed");
  });
});

describe("Content Deletion", () => {
  test("DELETE /api/content/:id - deletes item", async () => {
    const item = await ContentItem.create({ userId, type: "text", title: "To Delete", content: "Bye" });
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

describe("Security & Ownership", () => {
  let otherUserItem: any;

  beforeEach(async () => {
    otherUserItem = await ContentItem.create({
      userId: otherUserId,
      type: "text",
      title: "Secret Item",
      content: "This is not for you.",
    });
  });

  test("GET /api/content/:id - fails to get another user's item", async () => {
    const req = new Request(`http://localhost/api/content/${otherUserItem._id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });

  test("PUT /api/content/:id - fails to update another user's item", async () => {
    const req = new Request(`http://localhost/api/content/${otherUserItem._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ title: "Hacked" }),
    });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });

  test("DELETE /api/content/:id - fails to delete another user's item", async () => {
    const req = new Request(`http://localhost/api/content/${otherUserItem._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });
});

describe("Edge Cases & Validation", () => {
  test("JWT malformed or expired token", async () => {
    const req = new Request("http://localhost/api/content", {
      method: "GET",
      headers: { Authorization: `Bearer invalid.token.here` },
    });
    const res = await handler(req);
    expect(res.status).toBe(401);
  });

  test("GET /api/content/:id - fails with invalid ID format", async () => {
    const req = new Request(`http://localhost/api/content/invalid-id`, {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const res = await handler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("Invalid content ID format");
  });

  test("XSS attempt is stored as plain text", async () => {
    const maliciousContent = {
      type: "text",
      title: "<script>alert(1)</script>",
      content: "<img src='x' onerror='alert(1)' />",
    };
    const req = new Request("http://localhost/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify(maliciousContent),
    });
    const res = await handler(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.content.title).toBe(maliciousContent.title);
    expect(data.content.content).toBe(maliciousContent.content);
  });
});
