import { Router } from "express";
import ProductController from "../controllers/product.controller.js";
const router = Router();

const controller = new ProductController();

router.get('/', controller.generateMockedProducts);

export default router;