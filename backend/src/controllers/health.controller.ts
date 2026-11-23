import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { checkDatabaseHealth } from "../services/database.service.js";

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const database = await checkDatabaseHealth();

  res.json({
    ok: true,
    service: "CafeCommerce Auth API",
    database,
    frontendUrl: env.frontendUrl,
  });
}
