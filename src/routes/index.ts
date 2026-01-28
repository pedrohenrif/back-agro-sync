// ARQUIVO: src/routes/index.ts

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";

// Importação das suas rotas
import authRoutes from "./auth.routes.js";
import aiRoutes from "./ai.routes.js";
import gardenRoutes from "./garden.routes.js"; 
import dashboardRoutes from "./dashboard.routes.js";
import supplyRoutes from "./supply.routes.js";
import searchRoutes from "./search.routes.js";
import tasksRoutes from "./task.routes.js";
import cropPlanRoutes from './cropPlan.routes.js';
import supplyUsageRoutes from './supplyUsage.routes.js';
import harvestRoutes from './harvest.routes.js'; 

const router = Router();

router.use("/auth", authRoutes);
router.use("/", authMiddleware);

router.use("/tasks", tasksRoutes);
router.use("/ai", aiRoutes);
router.use("/gardens", gardenRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/supplies", supplyRoutes);
router.use("/search", searchRoutes);
router.use('/crop-plans', cropPlanRoutes);
router.use('/usage', supplyUsageRoutes);
router.use('/harvest', harvestRoutes);

export default router;