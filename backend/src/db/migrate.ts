import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";
import { getPool, closePool } from "./pool.js";
import { seedDatabase } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate(): Promise<void> {
  if (!env.databaseUrl) {
    console.error("❌ Add DATABASE_URL to backend/.env (Neon connection string)");
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  const pool = getPool();

  console.log("Running database migration...");
  await pool.query(schema);
  console.log("✅ Tables created successfully");

  const tables = await pool.query<{ table_name: string }>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));

  await seedDatabase();
  await closePool();
}

migrate().catch((err: Error) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
