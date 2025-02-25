import { Router } from "express";
import login from "./auth.routes.js";

const router = Router();

router.use("/login", login);

export default router;
