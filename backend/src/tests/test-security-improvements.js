#!/usr/bin/env node

/**
 * Security Improvements Test Script
 * This script tests all the security improvements we implemented
 */

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

// Test results collector
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

async function runTest(name, testFn) {
  log.info(`Testing: ${name}`);
  try {
    await testFn();
    testResults.passed++;
    testResults.tests.push({ name, status: "passed" });
    log.success(`${name} passed`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: "failed", error: error.message });
    log.error(`${name} failed: ${error.message}`);
  }
  console.log(""); // Empty line for readability
}

// Test 1: CORS Configuration
async function testCORS() {
  // Test with allowed origin
  const response1 = await fetch(`${API_BASE_URL}/health`, {
    headers: {
      Origin: "http://localhost:8081",
    },
  });

  const corsHeader = response1.headers.get("access-control-allow-origin");
  if (!corsHeader || corsHeader === "*") {
    throw new Error(
      `CORS not properly configured. Expected specific origin, got: ${corsHeader}`
    );
  }

  // Test with disallowed origin
  const response2 = await fetch(`${API_BASE_URL}/health`, {
    headers: {
      Origin: "https://malicious-site.com",
    },
  });

  const corsHeader2 = response2.headers.get("access-control-allow-origin");
  if (corsHeader2 === "https://malicious-site.com") {
    throw new Error("CORS allowing unauthorized origins!");
  }
}

// Test 2: Rate Limiting on Auth Endpoints
async function testAuthRateLimit() {
  const loginAttempts = [];

  // Make 6 login attempts (limit is 5)
  for (let i = 0; i < 6; i++) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "192.168.1.100", // Simulate same IP
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    });

    loginAttempts.push({
      attempt: i + 1,
      status: response.status,
      rateLimitHeaders: {
        limit: response.headers.get("x-ratelimit-limit"),
        remaining: response.headers.get("x-ratelimit-remaining"),
        reset: response.headers.get("x-ratelimit-reset"),
      },
    });
  }

  // Check if the 6th attempt was rate limited
  const lastAttempt = loginAttempts[5];
  if (lastAttempt.status !== 429) {
    throw new Error(
      `Rate limiting not working. Expected 429, got ${lastAttempt.status}`
    );
  }

  log.info("Rate limit headers from last attempt:");
  console.log(lastAttempt.rateLimitHeaders);
}

// Test 3: Request Size Limit
async function testRequestSizeLimit() {
  // Create a payload larger than 1MB
  const largePayload = {
    email: "test@example.com",
    password: "Test123!",
    username: "testuser",
    // Add a large string (over 1MB)
    extra: "x".repeat(1024 * 1024 + 1),
  };

  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(largePayload),
  });

  if (response.status !== 413) {
    throw new Error(
      `Body size limit not working. Expected 413, got ${response.status}`
    );
  }

  const data = await response.json();
  if (!data.message.includes("too large")) {
    throw new Error("Body size limit error message not descriptive");
  }
}

// Test 4: Health Check Endpoint
async function testHealthEndpoint() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (response.status !== 200) {
    throw new Error(`Health endpoint not working. Status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.hasOwnProperty("status") || !data.hasOwnProperty("dbConnected")) {
    throw new Error("Health endpoint missing expected fields");
  }
}

// Test 5: Environment Variable Validation
async function testEnvValidation() {
  // This test just checks if the server is running, which means env validation passed
  const response = await fetch(`${API_BASE_URL}/`);

  if (response.status !== 200) {
    throw new Error("Server not running properly with new env configuration");
  }
}

// Test 6: OAuth Redirect Configuration
// Test 6: OAuth Redirect Configuration
async function testOAuthRedirect() {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    redirect: "manual",
  });

  if (response.status !== 302 && response.status !== 301) {
    throw new Error(
      `OAuth redirect not working. Expected redirect, got ${response.status}`
    );
  }

  const location = response.headers.get("location");
  if (!location) {
    throw new Error("OAuth redirect missing location header");
  }

  // Check if redirect URL contains our base URL from env
  if (location.includes("archive-ctld.onrender.com")) {
    throw new Error("OAuth still using hardcoded redirect URL!");
  }

  log.info(`OAuth redirect URL: ${location.substring(0, 100)}...`);
}

// Main test runner
async function runAllTests() {
  console.log("🔒 Security Improvements Test Suite\n");
  console.log(`Testing against: ${API_BASE_URL}\n`);

  // Check if server is running
  try {
    await fetch(`${API_BASE_URL}/health`);
  } catch (error) {
    log.error("Server is not running! Please start the server first.");
    process.exit(1);
  }

  // Run all tests
  await runTest("Environment Variable Validation", testEnvValidation);
  await runTest("Health Endpoint", testHealthEndpoint);
  await runTest("CORS Configuration", testCORS);
  await runTest("Auth Rate Limiting", testAuthRateLimit);
  await runTest("Request Size Limit", testRequestSizeLimit);
  await runTest("OAuth Redirect Configuration", testOAuthRedirect);

  // Summary
  console.log("\n📊 Test Summary:");
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);

  if (testResults.failed > 0) {
    console.log("\n❌ Failed tests:");
    testResults.tests
      .filter((t) => t.status === "failed")
      .forEach((t) => log.error(`${t.name}: ${t.error}`));
    process.exit(1);
  } else {
    console.log("\n✅ All security improvements are working correctly!");
  }
}

// Run the tests
runAllTests().catch((error) => {
  log.error(`Test suite error: ${error.message}`);
  process.exit(1);
});
