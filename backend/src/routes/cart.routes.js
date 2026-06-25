import { Router } from "express";
import {
  getCart,
  addCartItem,
  updateCartItemHandler,
  removeCartItem,
  clearCartHandler,
  syncCart,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/sync", syncCart);
router.post("/items", addCartItem);
router.patch("/items/:productId", updateCartItemHandler);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCartHandler);

export default router;
