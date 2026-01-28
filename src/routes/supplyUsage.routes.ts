import { Router } from 'express';
import { applySupplyToGarden, getGardenUsageHistory } from '../controllers/supplyUsage.controller.js';

const router = Router();

router.post('/apply', applySupplyToGarden);
router.get('/history/:gardenId', getGardenUsageHistory);

export default router;