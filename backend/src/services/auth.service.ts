import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/pool.js";
import { env } from "../config/env.js";
import { toPublicUser, buildAvatarUrl } from "../utils/userMapper.js";
import type { UserRow, PublicUser, TokenPayload } from "../types/index.js";

interface CustomError extends Error {
  status?: number;
}

function createToken(user: PublicUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: PublicUser; token: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  const result = await query<UserRow>(
    `SELECT id, name, email, password_hash, avatar, created_at
     FROM users WHERE LOWER(email) = $1`,
    [normalizedEmail]
  );

  const user = result.rows[0];
  if (!user) {
    const error: CustomError = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const error: CustomError = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const publicUser = toPublicUser(user);
  const token = createToken(publicUser);

  return { user: publicUser, token };
}

export async function getUserById(userId: string): Promise<PublicUser> {
  const result = await query<UserRow>(
    `SELECT id, name, email, avatar, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (!result.rows[0]) {
    const error: CustomError = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return toPublicUser(result.rows[0]);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}

export async function seedDefaultUser(): Promise<void> {
  const adminEmail = "sunny260604@gmail.com";
  const existing = await query("SELECT id FROM users WHERE LOWER(email) = $1", [adminEmail]);

  if (existing.rows.length === 0) {
    const passwordHash = await bcrypt.hash("123123", 10);
    const avatar = buildAvatarUrl("Admin");
    await query(
      `INSERT INTO users (name, email, password_hash, avatar)
       VALUES ($1, $2, $3, $4)`,
      ["Admin", adminEmail, passwordHash, avatar]
    );
    console.log(`✅ Default admin ready: ${adminEmail} (password: 123123)`);
  }
}
