import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import UserController from "../controllers/user.controller.js";

const controller = new UserController();
const router = Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/profile', verifyToken, controller.profile);
router.post('/reset-pass', verifyToken, controller.resetPassword);
router.put('/new-password', verifyToken, controller.updatePassword);
router.post('/premium/:uid', verifyToken, controller.upgradeToPremium);
router.post('/:uid/documents', verifyToken, controller.uploadDocuments);
router.get('/', verifyToken, controller.getAllUsers);
router.delete('/', verifyToken, controller.deleteInactiveUsers);

export default router;