import { env } from "../config/env.js";
import { isStripeConfigured } from "../services/stripe.service.js";
import { checkDatabaseHealth } from "../services/database.service.js";

export async function getHealth(_req, res) {
  const database = await checkDatabaseHealth();

  res.json({
    ok: true,
    stripe: isStripeConfigured(),
    database,
    frontendUrl: env.frontendUrl,
  });
}
