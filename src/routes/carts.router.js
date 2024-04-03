import { Router } from "express";
import CartController from "../controllers/cart.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();
const controller = new CartController();

router.get("/", verifyToken, controller.getAll);
router.get("/:id", verifyToken, controller.getById);
router.post("/", verifyToken, controller.create);
router.put("/:id", verifyToken, controller.update);
router.delete("/:id", verifyToken, controller.remove);
router.post("/:idCart/products/:idProd", verifyToken, controller.addProdToCart);
router.delete("/:idCart/products/:idProd", verifyToken, controller.removeProdToCart);
router.delete("/clear/:idCart", verifyToken, controller.clearCart);

export default router;