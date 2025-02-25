import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";

const router = Router();

router.post('/login', (req, res) => {
    login(req, res);
});

export default router;
