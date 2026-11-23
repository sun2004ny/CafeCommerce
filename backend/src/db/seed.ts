import { seedDefaultUser } from "../services/auth.service.js";

export async function seedDatabase(): Promise<void> {
  await seedDefaultUser();
}
