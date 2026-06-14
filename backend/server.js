import express from "express";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";
import { testConnection } from "./db/pool.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeKey ? new Stripe(stripeKey) : null;

if (!stripeKey) {
  console.warn("⚠️  STRIPE_SECRET_KEY is missing in backend/.env — checkout will not work until you add it.");
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  let database = { connected: false };

  if (process.env.DATABASE_URL?.trim()) {
    try {
      const info = await testConnection();
      database = { connected: true, name: info.database, connectedAt: info.connected_at };
    } catch (err) {
      database = { connected: false, error: err.message };
    }
  } else {
    database = { connected: false, error: "DATABASE_URL not set in backend/.env" };
  }

  res.json({
    ok: true,
    stripe: Boolean(stripe),
    database,
    frontendUrl: FRONTEND_URL,
  });
});

app.post("/api/create-checkout-session", async (req, res) => {
  if (!stripe) {
    return res.status(503).json({
      error: "Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env",
    });
  }

  try {
    const { amount } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Order Payment",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${FRONTEND_URL}/cart?payment=success`,
      cancel_url: `${FRONTEND_URL}/cart?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.DATABASE_URL?.trim()) {
    try {
      const info = await testConnection();
      console.log(`✅ Neon DB connected (${info.database})`);
    } catch (err) {
      console.error(`❌ Neon DB connection failed: ${err.message}`);
    }
  } else {
    console.warn("⚠️  DATABASE_URL missing — add your Neon link to backend/.env, then run: npm run db:migrate");
  }

  app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
    console.log(`   Frontend (CORS): ${FRONTEND_URL}`);
  });
}

startServer();
