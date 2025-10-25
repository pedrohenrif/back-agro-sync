// ARQUIVO: src/routes/search.routes.ts

import { Router } from "express";
import { searchItems } from "../controllers/search.controller.js"; 

const router = Router();

router.get("/", (req, res) => {
  searchItems(req, res); 
});

export default router;