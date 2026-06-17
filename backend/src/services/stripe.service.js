import Stripe from "stripe";
import { env } from "../config/env.js";

let stripe = null;

export function getStripe() {
  if (!env.stripeSecretKey) return null;
  if (!stripe) stripe = new Stripe(env.stripeSecretKey);
  return stripe;
}

export function isStripeConfigured() {
  return Boolean(env.stripeSecretKey);
}

export async function createCheckoutSession(amount, frontendUrl) {
  const client = getStripe();
  if (!client) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env");
  }

  return client.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Order Payment" },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${frontendUrl}/cart?payment=success`,
    cancel_url: `${frontendUrl}/cart?payment=cancelled`,
  });
}
