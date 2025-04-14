import { Router } from 'express';
import { createGarden, getGardens } from '../controllers/garden.controller.js';

const router = Router();

router.post("/created-garden", (req, res) =>{
  createGarden(req, res)
});

router.get("/get-gardens", (req, res) =>{
  getGardens(req, res)
});

export default router;
