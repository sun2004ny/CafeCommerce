import { createCheckoutSession, isStripeConfigured } from "../services/stripe.service.js";
import { env } from "../config/env.js";

export async function createCheckoutSessionHandler(req, res, next) {
  if (!isStripeConfigured()) {
    return res.status(503).json({
      error: "Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env",
    });
  }

  try {
    const { amount } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const session = await createCheckoutSession(amount, env.frontendUrl);
    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
}
