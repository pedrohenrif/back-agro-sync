import { Router } from "express";
import { AuthController } from "./AuthController.js";
import { authenticateToken } from "../../../../@shared/infra/http/middlewares/auth.middleware.js";

const router = Router();
const authController = new AuthController();


router.post("/login", (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.get("/me", authenticateToken, (req, res, next) => {
  authController.getMe(req, res).catch(next);
});

export default router;