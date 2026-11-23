import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = env.databaseUrl;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set in backend/.env");
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 10000,
    });

    pool.on("error", (err: Error) => {
      // Idle clients may be terminated by Neon serverless; log as warning rather than uncaught error
      console.warn("Neon pool client notice (idle connection reset):", err.message);
    });
  }

  return pool;
}

export async function query<R extends pg.QueryResultRow = any>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<R>> {
  const p = getPool();
  try {
    return await p.query<R>(text, params);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === "ECONNRESET" || error.message?.includes("Connection terminated")) {
      // Serverless Neon closed idle socket — retry once on a fresh socket
      return await p.query<R>(text, params);
    }
    throw err;
  }
}

export async function testConnection(): Promise<{ connected_at: string; database: string }> {
  const result = await query<{ connected_at: string; database: string }>(
    "SELECT NOW() AS connected_at, current_database() AS database"
  );
  return result.rows[0];
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
