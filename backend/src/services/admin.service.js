import jwt from "jsonwebtoken";
import { getPool } from "../db/pool.js";
import { env } from "../config/env.js";
import { toPublicUser } from "../utils/userMapper.js";
import { getCartByUserId } from "./cart.service.js";

const ADMIN_EMAIL = env.adminEmail;
const ADMIN_PASSWORD = env.adminPassword;

function createAdminToken() {
  return jwt.sign(
    { role: "admin", email: ADMIN_EMAIL },
    env.jwtSecret,
    { expiresIn: "8h" }
  );
}

export function verifyAdminToken(token) {
  const payload = jwt.verify(token, env.jwtSecret);
  if (payload.role !== "admin") {
    const error = new Error("Admin access required");
    error.status = 403;
    throw error;
  }
  return payload;
}

export function loginAdmin(email, password) {
  const normalizedEmail = email?.toLowerCase().trim();

  if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    const error = new Error("Invalid admin credentials");
    error.status = 401;
    throw error;
  }

  return {
    token: createAdminToken(),
    admin: { email: ADMIN_EMAIL, role: "admin" },
  };
}

export async function getDashboardStats() {
  const pool = getPool();

  const [products, users, orders, revenue] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM products"),
    pool.query("SELECT COUNT(*)::int AS count FROM users"),
    pool.query("SELECT COUNT(*)::int AS count FROM orders"),
    pool.query(
      `SELECT COALESCE(SUM(total), 0)::float AS revenue FROM orders WHERE status IN ('completed', 'paid', 'delivered', 'pending')`
    ),
  ]);

  const recentOrders = await pool.query(
    `SELECT o.id, o.total, o.status, o.created_at, u.name AS user_name, u.email AS user_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC
     LIMIT 5`
  );

  return {
    totalProducts: products.rows[0].count,
    totalUsers: users.rows[0].count,
    totalOrders: orders.rows[0].count,
    totalRevenue: Number(revenue.rows[0].revenue),
    recentOrders: recentOrders.rows.map((r) => ({
      id: r.id,
      total: Number(r.total),
      status: r.status,
      createdAt: r.created_at,
      userName: r.user_name,
      userEmail: r.user_email,
    })),
  };
}

export async function listUsers() {
  const pool = getPool();
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.avatar, u.created_at,
      (SELECT COUNT(*)::int FROM orders o WHERE o.user_id = u.id) AS order_count,
      (SELECT COUNT(*)::int FROM cart_items ci WHERE ci.user_id = u.id) AS cart_count
     FROM users u
     ORDER BY u.created_at DESC`
  );

  return result.rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    avatar: r.avatar,
    createdAt: r.created_at,
    orderCount: r.order_count,
    cartCount: r.cart_count,
  }));
}

export async function getUserDetail(userId) {
  const pool = getPool();
  const userResult = await pool.query(
    `SELECT id, name, email, avatar, created_at, updated_at FROM users WHERE id = $1`,
    [userId]
  );

  if (!userResult.rows[0]) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const ordersResult = await pool.query(
    `SELECT o.*, 
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'title', oi.title,
            'price', oi.price,
            'quantity', oi.quantity,
            'thumbnail', oi.thumbnail
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId]
  );

  const cart = await getCartByUserId(userId);

  return {
    user: toPublicUser(userResult.rows[0]),
    orders: ordersResult.rows.map((o) => ({
      id: o.id,
      status: o.status,
      paymentMethod: o.payment_method,
      subtotal: Number(o.subtotal),
      tax: Number(o.tax),
      shipping: Number(o.shipping),
      total: Number(o.total),
      createdAt: o.created_at,
      items: o.items,
    })),
    cart,
  };
}

export async function deleteUser(userId) {
  const pool = getPool();
  const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);
  if (!result.rows[0]) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return { success: true };
}
