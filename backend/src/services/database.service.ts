import { testConnection } from "../db/pool.js";
import { env } from "../config/env.js";

export interface DatabaseHealthResult {
  connected: boolean;
  name?: string;
  connectedAt?: string;
  error?: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  if (!env.databaseUrl) {
    return { connected: false, error: "DATABASE_URL not set in backend/.env" };
  }

  try {
    const info = await testConnection();
    return { connected: true, name: info.database, connectedAt: info.connected_at };
  } catch (err: unknown) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Unknown database error",
    };
  }
}

export async function verifyDatabaseOnStartup(): Promise<void> {
  if (!env.databaseUrl) {
    console.warn("⚠️  DATABASE_URL missing in backend/.env");
    return;
  }

  try {
    const info = await testConnection();
    console.log(`✅ Neon DB connected (${info.database})`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Neon DB connection failed: ${msg}`);
  }
}
