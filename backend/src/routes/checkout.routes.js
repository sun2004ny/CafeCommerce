import { Router } from "express";
import { createCheckoutSessionHandler } from "../controllers/checkout.controller.js";

const router = Router();

router.post("/create-checkout-session", createCheckoutSessionHandler);

export default router;
