import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

export const env = {
  port: Number(process.env.PORT) || 5000,
  frontendUrl,
  corsOrigin: (process.env.CORS_ORIGIN || frontendUrl).replace(/\/$/, ""),
  databaseUrl: process.env.DATABASE_URL?.trim() || "",
  jwtSecret: process.env.JWT_SECRET?.trim() || "dev-jwt-secret-change-in-production",
};
