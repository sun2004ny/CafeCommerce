import dotenv from "dotenv";

dotenv.config();

const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

export const env = {
  port: Number(process.env.PORT) || 5000,
  frontendUrl,
  corsOrigin: (process.env.CORS_ORIGIN || frontendUrl).replace(/\/$/, ""),
  databaseUrl: process.env.DATABASE_URL?.trim() || "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY?.trim() || "",
  jwtSecret: process.env.JWT_SECRET?.trim() || "dev-jwt-secret-change-in-production",
};
