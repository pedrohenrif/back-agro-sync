import { Router } from 'express';
import { recordHarvest, getHarvestHistory, getHarvestsByGarden } from '../controllers/harvest.controller.js';

const router = Router();

router.post('/', recordHarvest);
router.get('/', getHarvestHistory);
router.get('/garden/:gardenId', getHarvestsByGarden);

export default router;