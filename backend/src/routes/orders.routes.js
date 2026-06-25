import { Router } from "express";
import { placeOrder, getMyOrders } from "../controllers/orders.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.post("/", placeOrder);
router.get("/", getMyOrders);

export default router;
