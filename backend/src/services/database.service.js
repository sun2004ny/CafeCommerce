import { testConnection } from "../db/pool.js";
import { env } from "../config/env.js";

export async function checkDatabaseHealth() {
  if (!env.databaseUrl) {
    return { connected: false, error: "DATABASE_URL not set in backend/.env" };
  }

  try {
    const info = await testConnection();
    return { connected: true, name: info.database, connectedAt: info.connected_at };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

export async function verifyDatabaseOnStartup() {
  if (!env.databaseUrl) {
    console.warn(
      "⚠️  DATABASE_URL missing — add your Neon link to backend/.env, then run: npm run db:migrate"
    );
    return;
  }

  try {
    const info = await testConnection();
    console.log(`✅ Neon DB connected (${info.database})`);
  } catch (err) {
    console.error(`❌ Neon DB connection failed: ${err.message}`);
  }
}
