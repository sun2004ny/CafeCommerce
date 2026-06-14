import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set in backend/.env");
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });

    pool.on("error", (err) => {
      console.error("Unexpected database pool error:", err);
    });
  }

  return pool;
}

export async function testConnection() {
  const result = await getPool().query(
    "SELECT NOW() AS connected_at, current_database() AS database"
  );
  return result.rows[0];
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
