import { Router } from "express";
import login from "./auth.routes.js";
import aiRoutes from "./ai.routes.js";
import managerGarden from "./managerGarden.routes.js"
import dashboard from "./dashboard.routes.js"
import supply from "./supply.routes.js"
import search from "./search.routes.js";


const router = Router();

router.use("/", login);
router.use("/ask-ai", aiRoutes);
router.use("/manager-garden", managerGarden);
router.use("/dashboard", dashboard);
router.use("/supply", supply)
router.use("/search", search);

export default router;
