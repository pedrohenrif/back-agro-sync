import { Router } from "express";
import { login, register, getMe } from "../controllers/auth.controller.js";
import { authMiddleware } from '../@shared/infra/http/middlewares/auth.middleware.js';
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

export default router