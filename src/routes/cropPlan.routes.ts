import { Router } from 'express';
import { getCropPlans, getCropPlanById } from '../controllers/cropPlan.controller.js';

const router = Router();

router.get('/', getCropPlans);
router.get('/:id', getCropPlanById);

export default router;