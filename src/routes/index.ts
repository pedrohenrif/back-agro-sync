import { Router } from "express";
import login from "./auth.routes.js";
import aiRoutes from "./ai.routes.js";
import managerGarden from "./managerGarden.routes.js"

const router = Router();

router.use("/login", login);
router.use("/ask-ai", aiRoutes);
router.use("/manager-garden", managerGarden);

export default router;
