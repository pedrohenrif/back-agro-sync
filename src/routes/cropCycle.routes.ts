import { Router } from 'express';
import {startPlantingCycle} from '../controllers/cropCycle.controller.js';

const router = Router();

router.post('/', startPlantingCycle);

export default router;