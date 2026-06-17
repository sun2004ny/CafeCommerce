import { Router } from "express";
import healthRoutes from "./health.routes.js";
import checkoutRoutes from "./checkout.routes.js";
import authRoutes from "./auth.routes.js";
import productsRoutes from "./products.routes.js";
import cartRoutes from "./cart.routes.js";
import ordersRoutes from "./orders.routes.js";

const router = Router();

router.use(healthRoutes);
router.use(checkoutRoutes);
router.use("/auth", authRoutes);
router.use("/products", productsRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", ordersRoutes);

export default router;
