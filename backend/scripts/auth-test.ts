/**
 * Focused authentication & session test suite
 * Run: npm test (from backend folder)
 */
import { env } from "../src/config/env.js";

const BASE = `http://localhost:${env.port || 5000}/api`;
const DEMO_USER = {
  email: "sunny260604@gmail.com",
  password: "123123",
};

interface TestResult {
  name: string;
  passed: boolean;
  detail?: string;
}

const tests: TestResult[] = [];

function pass(name: string) {
  tests.push({ name, passed: true });
  console.log(`  ✅ ${name}`);
}

function fail(name: string, detail: string) {
  tests.push({ name, passed: false, detail });
  console.log(`  ❌ ${name}: ${detail}`);
}

async function run() {
  console.log("═══════════════════════════════════════");
  console.log("  CaféCommerce Auth & Dashboard Tests");
  console.log("═══════════════════════════════════════\n");

  // 1. Health check
  try {
    const res = await fetch(`${BASE}/health`);
    const data = (await res.json()) as { ok?: boolean; database?: { connected?: boolean } };
    if (res.ok && data.ok && data.database?.connected) {
      pass("Backend health & database connection");
    } else {
      fail("Backend health", JSON.stringify(data));
    }
  } catch (err: any) {
    fail("Backend health crash", err.message);
  }

  // 2. Login validation error (missing password)
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: DEMO_USER.email }),
    });
    if (res.status === 400) {
      pass("Reject missing password validation (HTTP 400)");
    } else {
      fail("Missing password validation", `status: ${res.status}`);
    }
  } catch (err: any) {
    fail("Validation error crash", err.message);
  }

  // 3. Login with invalid credentials
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: DEMO_USER.email, password: "wrongpassword" }),
    });
    if (res.status === 401) {
      pass("Reject invalid password (HTTP 401)");
    } else {
      fail("Invalid password rejection", `status: ${res.status}`);
    }
  } catch (err: any) {
    fail("Invalid password crash", err.message);
  }

  // 4. Login with valid credentials
  let token = "";
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DEMO_USER),
    });
    const data = (await res.json()) as { token?: string; user?: { email: string } };
    if (res.ok && data.token && data.user?.email === DEMO_USER.email) {
      token = data.token;
      pass("Successful login with valid credentials (returns JWT token)");
    } else {
      fail("Valid login failed", JSON.stringify(data));
    }
  } catch (err: any) {
    fail("Valid login crash", err.message);
  }

  // 5. Access /auth/me without token (must be rejected)
  try {
    const res = await fetch(`${BASE}/auth/me`);
    if (res.status === 401) {
      pass("Unauthenticated access to /auth/me rejected (HTTP 401)");
    } else {
      fail("Unauthenticated protection", `status: ${res.status}`);
    }
  } catch (err: any) {
    fail("Unauthenticated protection crash", err.message);
  }

  // 6. Access /auth/me with valid Bearer token
  try {
    const res = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as { user?: { id: string; email: string; name: string } };
    if (res.ok && data.user?.email === DEMO_USER.email) {
      pass("Authenticated user profile retrieved via /auth/me");
    } else {
      fail("Retrieve /auth/me with token", JSON.stringify(data));
    }
  } catch (err: any) {
    fail("/auth/me with token crash", err.message);
  }

  // 7. Logout endpoint
  try {
    const res = await fetch(`${BASE}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      pass("Logout endpoint returns success");
    } else {
      fail("Logout endpoint", `status: ${res.status}`);
    }
  } catch (err: any) {
    fail("Logout crash", err.message);
  }

  console.log("\n═══════════════════════════════════════");
  const passedCount = tests.filter((t) => t.passed).length;
  const failedCount = tests.filter((t) => !t.passed).length;
  console.log(`  PASSED: ${passedCount}`);
  console.log(`  FAILED: ${failedCount}`);
  console.log("═══════════════════════════════════════\n");

  if (failedCount > 0) process.exit(1);
}

run();
