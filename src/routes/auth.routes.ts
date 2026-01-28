import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post('/login', (req, res) => {
    login(req, res);
});

router.post('/register', (req, res) => {
    register(req, res);
});

export default router