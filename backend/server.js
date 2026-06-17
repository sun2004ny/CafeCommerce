import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { isStripeConfigured } from "./src/services/stripe.service.js";
import { verifyDatabaseOnStartup } from "./src/services/database.service.js";

async function startServer() {
  if (!isStripeConfigured()) {
    console.warn(
      "⚠️  STRIPE_SECRET_KEY is missing in backend/.env — checkout will not work until you add it."
    );
  }

  await verifyDatabaseOnStartup();

  app.listen(env.port, () => {
    console.log(`✅ Backend running on http://localhost:${env.port}`);
    console.log(`   Frontend (CORS): ${env.frontendUrl}`);
  });
}

startServer();
