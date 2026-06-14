import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { getPool, closePool } from "./pool.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("❌ Add DATABASE_URL to backend/.env (Neon connection string)");
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  const pool = getPool();

  console.log("Running database migration...");
  await pool.query(schema);
  console.log("✅ Tables created successfully");

  const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));
  await closePool();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
