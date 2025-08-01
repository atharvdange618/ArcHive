import { test, expect } from "vitest";
import app from "../app";
import { handle } from "hono/vercel";
import User from "../db/models/User";
import BlacklistedToken from "../db/models/BlacklistedToken";

const handler = handle(app);

// --- Auth tests

test("Auth: POST /api/auth/register - Successfully registers a new user", async () => {
  const req = new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "register@example.com",
      password: "StrongPassword@123",
      firstName: "Test",
      lastName: "User",
    }),
  });

  const res = await handler(req);

  expect(res.status).toBe(201);
  const data = await res.json();

  expect(data).toHaveProperty("message", "Registration successful!");
  expect(data).toHaveProperty("user");
  expect(data.user).not.toHaveProperty("username");
  expect(data.user).toHaveProperty("email", "register@example.com");
  expect(data.user).toHaveProperty("_id");
  expect(data).toHaveProperty("accessToken");
  expect(data).toHaveProperty("refreshToken");

  // Verify if the user exists in the db
  const userInDb = await User.findOne({ email: "register@example.com" });
  expect(userInDb).not.toBeNull();
  expect(userInDb).not.toHaveProperty("username");
});

test("Auth: POST /api/auth/register - Fails with existing email", async () => {
  // register a user
  await new User({
    email: "existing@example.com",
    password: "Password123!",
    firstName: "Existing",
    lastName: "User",
  }).save();

  const req = new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "existing@example.com", // Duplicate email
      password: "AnotherStrongPassword@123",
      firstName: "Another",
      lastName: "User",
    }),
  });

  const res = await handler(req);

  expect(res.status).toBe(409);
  const data = await res.json();
  expect(data).toHaveProperty("message", "Email already registered.");
});





test("Auth: POST /api/auth/register - Fails with invalid email format", async () => {
  const req = new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "invalid-email", // Invalid format
      password: "StrongPassword@123",
      firstName: "Test",
      lastName: "User",
    }),
  });

  const res = await handler(req);

  expect(res.status).toBe(400); // Bad Request (validation)
  const data = await res.json();

  expect(data.message).toContain("Validation failed");
  expect(data).toHaveProperty("details");
  expect(Array.isArray(data.details.errors)).toBe(true);
  expect(
    data.details.errors.some((e: any) =>
      e.message.includes("Invalid email address")
    )
  ).toBe(true);
});

test("Auth: POST /api/auth/register - Fails with weak password (missing uppercase)", async () => {
  const req = new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "weakpass@example.com",
      password: "password123!", // Missing uppercase
      firstName: "Test",
      lastName: "User",
    }),
  });

  const res = await handler(req);

  expect(res.status).toBe(400); // Bad Request (validation)
  const data = await res.json();

  expect(data.message).toContain("Validation failed");
  expect(data).toHaveProperty("details");
  expect(Array.isArray(data.details.errors)).toBe(true);
  expect(
    data.details.errors.some((e: any) =>
      e.message.includes("Password must contain at least one uppercase letter")
    )
  ).toBe(true);
});

test("Auth: POST /api/auth/login - Successfully logs in an existing user", async () => {
  // register a user to log in
  const registerRes = await handler(
    new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "login@example.com",
        password: "LoginPassword@123",
        firstName: "Login",
        lastName: "User",
      }),
    })
  );
  const registerData = await registerRes.json();

  const req = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "login@example.com",
      password: "LoginPassword@123",
    }),
  });

  const res = await handler(req);

  expect(res.status).toBe(200);
  const data = await res.json();

  expect(data).toHaveProperty("message", "Login successful!");
  expect(data).toHaveProperty("user");
  expect(data.user).toHaveProperty("email", "login@example.com");
  expect(data).toHaveProperty("accessToken");
  expect(data).toHaveProperty("refreshToken");
});

test("Auth: POST /api/auth/login - Fails with invalid password", async () => {
  // register a user
  await handler(
    new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "badpass@example.com",
        password: "CorrectPassword@123",
        firstName: "Badpass",
        lastName: "User",
      }),
    })
  );

  const req = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "badpass@example.com",
      password: "Password123!", // Incorrect password
    }),
  });

  const res = await handler(req);

  expect(res.status).toBe(401); // Unauthorized
  const data = await res.json();

  expect(data).toHaveProperty("message", "Invalid credentials.");
});

test("Auth: POST /api/auth/login - Fails with invalid email format", async () => {
  const req = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "invalid-email-login", // Invalid format
      password: "AnyPassword@123",
    }),
  });

  const res = await handler(req);

  expect(res.status).toBe(400); // Bad Request (validation)
  const data = await res.json();

  expect(data.message).toContain("Validation failed");
  expect(data).toHaveProperty("details");
  expect(Array.isArray(data.details.errors)).toBe(true);
  expect(
    data.details.errors.some((e: any) =>
      e.message.includes("Invalid email address")
    )
  ).toBe(true);
});

test("Auth: POST /api/auth/login - Fails with missing password", async () => {
  const req = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "test@example.com",
      // password: missing
    }),
  });

  const res = await handler(req);

  expect(res.status).toBe(400); // Bad Request (validation)
  const data = await res.json();

  expect(data.message).toContain("Validation failed");
  expect(data).toHaveProperty("details");
  expect(Array.isArray(data.details.errors)).toBe(true);
  expect(
    data.details.errors.some((e: any) =>
      e.message.includes("Password is required")
    )
  ).toBe(true);
});

test("Auth: POST /api/auth/logout - Successfully logs out a user and blacklists the token", async () => {
  await handler(
    new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "logout@example.com",
        password: "LogoutPassword@123",
        firstName: "Logout",
        lastName: "User",
      }),
    })
  );

  const loginRes = await handler(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "logout@example.com",
        password: "LogoutPassword@123",
      }),
    })
  );
  const { accessToken, refreshToken } = await loginRes.json();

  const logoutReq = new Request("http://localhost/api/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const logoutRes = await handler(logoutReq);

  expect(logoutRes.status).toBe(200);
  const logoutData = await logoutRes.json();
  expect(logoutData).toHaveProperty("message", "Logout successful.");

  const blacklisted = await BlacklistedToken.findOne({ token: accessToken });
  expect(blacklisted).not.toBeNull();
  expect(blacklisted?.token).toBe(accessToken);
});

test("Auth: POST /api/auth/logout - Fails if no token is provided", async () => {
  const logoutReq = new Request("http://localhost/api/auth/logout", {
    method: "POST",
  });

  const logoutRes = await handler(logoutReq);

  expect(logoutRes.status).toBe(401);
  const logoutData = await logoutRes.json();
  expect(logoutData).toHaveProperty(
    "message",
    "no authorization included in request"
  );
});

test("Auth: POST /api/auth/refresh - Successfully refreshes the access token", async () => {
  await handler(
    new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "refresh@example.com",
        password: "RefreshPassword@123",
        firstName: "Refresh",
        lastName: "User",
      }),
    })
  );

  const loginRes = await handler(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "refresh@example.com",
        password: "RefreshPassword@123",
      }),
    })
  );
  const { refreshToken } = await loginRes.json();

  const refreshReq = new Request("http://localhost/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const refreshRes = await handler(refreshReq);

  expect(refreshRes.status).toBe(200);
  const refreshData = await refreshRes.json();
  expect(refreshData).toHaveProperty(
    "message",
    "Token refreshed successfully!"
  );
  expect(refreshData).toHaveProperty("accessToken");
  expect(refreshData.accessToken).not.toBeNull();
});

test("Auth: POST /api/auth/refresh - Fails with an invalid or expired refresh token", async () => {
  const refreshReq = new Request("http://localhost/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: "invalidtoken" }),
  });

  const refreshRes = await handler(refreshReq);

  expect(refreshRes.status).toBe(401);
  const refreshData = await refreshRes.json();
  expect(refreshData).toHaveProperty("message", "Invalid refresh token.");
});

test("Auth: POST /api/auth/refresh - Fails if refresh token is missing", async () => {
  const refreshReq = new Request("http://localhost/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // No refreshToken provided
  });

  const refreshRes = await handler(refreshReq);

  expect(refreshRes.status).toBe(400);
  const refreshData = await refreshRes.json();
  expect(refreshData.message).toContain("Validation failed");
  expect(refreshData.details.errors[0].message).toBe(
    "Refresh token is required"
  );
});
