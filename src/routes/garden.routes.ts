// ARQUIVO: src/routes/garden.routes.ts

import { Router } from "express";
import { 
  getGardens, 
  createGarden, 
  updateGarden, 
  deleteGarden,
  calculatePlantingStand
} from "../controllers/garden.controller.js";

const router = Router();

router.get("/", getGardens);
router.post("/", createGarden);
router.put("/:id", updateGarden);
router.delete("/:id", deleteGarden);
router.post('/calculate-stand', calculatePlantingStand);

export default router;