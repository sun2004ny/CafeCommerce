/**
 * CafeCommerce full system API test suite
 * Run: node scripts/system-test.js (from backend folder)
 */
import { env } from "../src/config/env.js";

const BASE = `http://localhost:${env.port || 5000}/api`;
const ADMIN_EMAIL = "ex123@gmail.com";
const ADMIN_PASSWORD = "123123";
const TEST_USER = {
  name: "Test User",
  email: `test_${Date.now()}@cafecommerce.test`,
  password: "testpass123",
};

const results = { passed: [], failed: [], warnings: [] };

function pass(name) {
  results.passed.push(name);
  console.log(`  ✅ ${name}`);
}

function fail(name, detail) {
  results.failed.push({ name, detail });
  console.log(`  ❌ ${name}: ${detail}`);
}

function warn(name, detail) {
  results.warnings.push({ name, detail });
  console.log(`  ⚠️  ${name}: ${detail}`);
}

async function req(method, path, { body, token, adminToken } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (adminToken) headers.Authorization = `Bearer ${adminToken}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, ok: res.ok };
}

async function testHealth() {
  console.log("\n📡 1. System & connectivity");
  const { ok, data } = await req("GET", "/health");
  if (ok && data.ok) pass("Health endpoint");
  else fail("Health endpoint", JSON.stringify(data));

  if (data.database?.connected) pass("Database connected");
  else fail("Database connected", data.database?.error || "not connected");
}

async function testDatabaseTables() {
  console.log("\n🗄️  2. Database tables");
  const { getPool, closePool } = await import("../src/db/pool.js");
  const pool = getPool();
  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  const names = tables.rows.map((r) => r.table_name);
  const expected = ["addresses", "cart_items", "coupons", "order_items", "orders", "products", "users"];
  for (const t of expected) {
    if (names.includes(t)) pass(`Table exists: ${t}`);
    else fail(`Table exists: ${t}`, "missing");
  }
  const unexpected = names.filter((n) => !expected.includes(n));
  if (unexpected.length) warn("Unexpected tables", unexpected.join(", "));
  else pass("No unexpected tables");
  await closePool();
}

async function testAuth() {
  console.log("\n🔐 3. Authentication");
  const reg = await req("POST", "/auth/register", { body: TEST_USER });
  if (reg.status === 201 && reg.data.user?.email) pass("User registration");
  else fail("User registration", reg.data.error || reg.status);

  const login = await req("POST", "/auth/login", {
    body: { email: TEST_USER.email, password: TEST_USER.password },
  });
  if (login.ok && login.data.token) pass("User login");
  else fail("User login", login.data.error);

  const userToken = login.data.token;

  const me = await req("GET", "/auth/me", { token: userToken });
  if (me.ok && me.data.user?.email === TEST_USER.email) pass("User session /me");
  else fail("User session /me", me.data.error);

  const adminLogin = await req("POST", "/admin/login", {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (adminLogin.ok && adminLogin.data.token) pass("Admin login");
  else fail("Admin login", adminLogin.data.error);

  const adminToken = adminLogin.data.token;

  const badAdmin = await req("POST", "/admin/login", {
    body: { email: TEST_USER.email, password: TEST_USER.password },
  });
  if (badAdmin.status === 401) pass("Normal user blocked from admin login");
  else fail("Normal user blocked from admin login", `status ${badAdmin.status}`);

  const userOnAdmin = await req("GET", "/admin/stats", { token: userToken });
  if (userOnAdmin.status === 401) pass("User token blocked from admin API");
  else fail("User token blocked from admin API", `status ${userOnAdmin.status}`);

  const noAuthAdmin = await req("GET", "/admin/stats");
  if (noAuthAdmin.status === 401) pass("Unauthenticated blocked from admin API");
  else fail("Unauthenticated blocked from admin API", `status ${noAuthAdmin.status}`);

  return { userToken, adminToken };
}

async function testProducts(adminToken) {
  console.log("\n📦 4. Products API");
  const list = await req("GET", "/products?limit=5");
  if (list.ok && Array.isArray(list.data.products)) pass("List products (public)");
  else fail("List products", list.data.error);

  const cats = await req("GET", "/products/categories");
  if (cats.ok && Array.isArray(cats.data.categories)) pass("List categories");
  else fail("List categories", cats.data.error);

  const created = await req("POST", "/admin/products", {
    adminToken,
    body: {
      title: "System Test Product",
      description: "Auto test",
      price: 9.99,
      discountPercentage: 5,
      stock: 10,
      stockStatus: "in_stock",
      couponCode: "TESTSYS",
      category: "test",
      brand: "TestBrand",
      thumbnail: "https://placehold.co/100x100",
    },
  });
  if (created.status === 201 && created.data.product?.id) {
    pass("Admin create product");
  } else fail("Admin create product", created.data.error);

  const productId = created.data.product?.id;

  const updated = await req("PATCH", `/admin/products/${productId}`, {
    adminToken,
    body: { stockStatus: "out_of_stock", stock: 0 },
  });
  if (updated.ok && updated.data.product?.stockStatus === "out_of_stock") {
    pass("Admin update product stock status");
  } else fail("Admin update product", updated.data.error);

  const noAuthCreate = await req("POST", "/admin/products", {
    body: { title: "Hack", price: 1 },
  });
  if (noAuthCreate.status === 401) pass("Unauthenticated blocked from create product");
  else fail("Unauthenticated product create", `status ${noAuthCreate.status}`);

  return productId;
}

async function testCart(userToken, productId) {
  console.log("\n🛒 5. Cart API");
  const add = await req("POST", "/cart/items", {
    token: userToken,
    body: { productId, quantity: 2 },
  });
  if (add.ok && add.data.items?.length > 0) pass("Add to cart");
  else fail("Add to cart", add.data.error);

  const get = await req("GET", "/cart", { token: userToken });
  const item = get.data.items?.find((i) => i.id === productId);
  if (item?.quantity === 2) pass("Cart quantity persisted");
  else fail("Cart quantity", `expected 2, got ${item?.quantity}`);

  const patch = await req("PATCH", `/cart/items/${productId}`, {
    token: userToken,
    body: { quantity: 1 },
  });
  if (patch.ok) pass("Update cart quantity");

  const noAuthCart = await req("GET", "/cart");
  if (noAuthCart.status === 401) pass("Unauthenticated blocked from cart");
  else fail("Unauthenticated cart", `status ${noAuthCart.status}`);

  return get.data.items;
}

async function testOrders(userToken, productId) {
  console.log("\n📋 6. Orders API");
  const order = await req("POST", "/orders", {
    token: userToken,
    body: {
      items: [{ id: productId, productId, title: "System Test Product", price: 9.99, quantity: 1 }],
      paymentMethod: "cod",
      subtotal: 9.99,
      tax: 0.8,
      shipping: 9.99,
      total: 20.78,
      address: {
        name: "Home",
        street: "1 Test St",
        city: "Test City",
        state: "TS",
        zip: "12345",
        phone: "555-0100",
      },
    },
  });
  if (order.status === 201 && order.data.order?.id) pass("Place COD order");
  else fail("Place COD order", order.data.error);

  const emptyOrder = await req("POST", "/orders", {
    token: userToken,
    body: { items: [], paymentMethod: "cod", subtotal: 0, tax: 0, shipping: 0, total: 0 },
  });
  if (emptyOrder.status === 400) pass("Empty order rejected");
  else fail("Empty order validation", `status ${emptyOrder.status}`);

  const cartAfter = await req("GET", "/cart", { token: userToken });
  if (cartAfter.data.items?.length === 0) pass("Cart cleared after order");
  else fail("Cart cleared after order", `items: ${cartAfter.data.items?.length}`);
}

async function testAdminPanel(adminToken, userToken) {
  console.log("\n👑 7. Admin panel API");
  const stats = await req("GET", "/admin/stats", { adminToken });
  if (stats.ok && typeof stats.data.totalProducts === "number") pass("Dashboard stats");
  else fail("Dashboard stats", stats.data.error);

  const users = await req("GET", "/admin/users", { adminToken });
  if (users.ok && users.data.users?.length > 0) pass("List users");
  else fail("List users", users.data.error);

  const userId = users.data.users[0]?.id;
  if (userId) {
    const detail = await req("GET", `/admin/users/${userId}`, { adminToken });
    if (detail.ok && detail.data.user) pass("User detail with cart/orders");
    else fail("User detail", detail.data.error);
  }

  const deleted = await req("DELETE", `/admin/products/${999999}`, { adminToken });
  if (deleted.status === 404 || deleted.data.error) pass("Delete invalid product returns error");
}

async function cleanup(adminToken, productId) {
  if (productId) {
    await req("DELETE", `/admin/products/${productId}`, { adminToken });
  }
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  CafeCommerce System Test Suite");
  console.log("═══════════════════════════════════════");

  try {
    await testHealth();
    await testDatabaseTables();
    const { userToken, adminToken } = await testAuth();
    const productId = await testProducts(adminToken);
    await testCart(userToken, productId);
    await testOrders(userToken, productId);
    await testAdminPanel(adminToken, userToken);
    await cleanup(adminToken, productId);
  } catch (err) {
    fail("Test suite crash", err.message);
    console.error(err);
  }

  console.log("\n═══════════════════════════════════════");
  console.log(`  PASSED: ${results.passed.length}`);
  console.log(`  FAILED: ${results.failed.length}`);
  console.log(`  WARNINGS: ${results.warnings.length}`);
  console.log("═══════════════════════════════════════");

  if (results.failed.length) {
    console.log("\nFailures:");
    results.failed.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`));
    process.exit(1);
  }
}

main();
