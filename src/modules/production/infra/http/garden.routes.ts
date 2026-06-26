import { Router } from "express";
import { GardenController } from "./GardenController.js";
import { authenticateToken } from "../../../../@shared/infra/http/middlewares/auth.middleware.js";

const router = Router();
const gardenController = new GardenController();

router.use(authenticateToken);

router.get("/", (req, res, next) => {
  gardenController.index(req, res).catch(next);
});

router.post("/", (req, res, next) => {
  gardenController.create(req, res).catch(next);
});

router.put("/:id", (req, res, next) => {
  gardenController.update(req, res).catch(next);
});

router.delete("/:id", (req, res, next) => {
  gardenController.delete(req, res).catch(next);
});

router.post("/calculate-stand", (req, res, next) => {
  gardenController.calculate(req, res).catch(next);
});

export default router;