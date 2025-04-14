import { Router } from 'express';
import { createGarden } from '../controllers/garden.controller.js';

const router = Router();

router.post("/", (req, res) =>{
  createGarden(req, res)
});

export default router;
