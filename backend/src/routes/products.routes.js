import { Router } from "express";
import {
  listProductsHandler,
  getCategoriesHandler,
  getProductHandler,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", listProductsHandler);
router.get("/categories", getCategoriesHandler);
router.get("/:id", getProductHandler);

export default router;
