import { Router } from "express";
import { askAI } from "../controllers/askAi.controller.js";

const router = Router();

router.post("/", (req, res) =>{
    askAI(req, res)
});

export default router;
