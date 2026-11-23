import app from "./app.js";
import { env } from "./config/env.js";
import { verifyDatabaseOnStartup } from "./services/database.service.js";
import { seedDefaultUser } from "./services/auth.service.js";

async function startServer(): Promise<void> {
  await verifyDatabaseOnStartup();
  await seedDefaultUser().catch((err: Error) => {
    console.warn("User seed warning:", err.message);
  });

  app.listen(env.port, () => {
    console.log(`✅ CaféCommerce Backend running on http://localhost:${env.port}`);
    console.log(`   Frontend URL (CORS): ${env.frontendUrl}`);
  });
}

startServer();
