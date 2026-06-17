import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getPool } from "../db/pool.js";
import { env } from "../config/env.js";
import { toPublicUser, buildAvatarUrl } from "../utils/userMapper.js";

function createToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    env.jwtSecret,
    { expiresIn: "30d" }
  );
}

export async function registerUser(name, email, password) {
  const pool = getPool();
  const avatar = buildAvatarUrl(name);
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, avatar)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, avatar, created_at`,
      [name, email, passwordHash, avatar]
    );

    return toPublicUser(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      const error = new Error("Email already registered");
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

export async function loginUser(email, password) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, name, email, password_hash, avatar, created_at
     FROM users WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const publicUser = toPublicUser(user);
  const token = createToken(publicUser);

  return { user: publicUser, token };
}

export async function getUserById(userId) {
  const pool = getPool();
  const result = await pool.query(
    `SELECT id, name, email, avatar, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (!result.rows[0]) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return toPublicUser(result.rows[0]);
}

export async function updateUserProfile(userId, updates) {
  const pool = getPool();
  const current = await pool.query(
    `SELECT id, name, email, password_hash, avatar, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (!current.rows[0]) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const existing = current.rows[0];
  const name = updates.name?.trim() || existing.name;
  const email = updates.email?.toLowerCase() || existing.email;
  let passwordHash = existing.password_hash;

  if (updates.password) {
    passwordHash = await bcrypt.hash(updates.password, 10);
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, password_hash = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, email, avatar, created_at`,
      [name, email, passwordHash, userId]
    );

    return toPublicUser(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      const error = new Error("Email already in use");
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
