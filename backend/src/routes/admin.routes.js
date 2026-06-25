import { Router } from "express";
import {
  adminLogin,
  adminStats,
  adminListUsers,
  adminGetUser,
  adminDeleteUser,
} from "../controllers/admin.controller.js";
import {
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  listCouponsHandler,
} from "../controllers/products.controller.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.post("/login", adminLogin);

router.use(requireAdmin);

router.get("/stats", adminStats);
router.get("/users", adminListUsers);
router.get("/users/:userId", adminGetUser);
router.delete("/users/:userId", adminDeleteUser);

router.get("/coupons", listCouponsHandler);
router.post("/products", createProductHandler);
router.patch("/products/:id", updateProductHandler);
router.delete("/products/:id", deleteProductHandler);

export default router;
