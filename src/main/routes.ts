import { Router } from "express";
import gardenRoutes from "../modules/production/infra/http/garden.routes.js";
import authRoutes from "../modules/identity/infra/http/auth.routes.js";
import dashboardRoutes from "../routes/dashboard.routes.js";

const routes = Router();

routes.use("/gardens", gardenRoutes);
routes.use("/auth", authRoutes);
routes.use("/dashboard", dashboardRoutes);

export default routes;