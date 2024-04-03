import { Router } from "express";
import ProductController from "../controllers/product.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();
const controller = new ProductController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.delete);
router.post('/dto', verifyToken, controller.createProduct);
router.get('/dto/:id', verifyToken, controller.getProductById);

export default router;