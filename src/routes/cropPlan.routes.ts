import { Router } from 'express';
import { 
  getCropPlans, 
  getCropPlanById, 
  createCropPlan, 
  updateCropPlan, 
  deleteCropPlan 
} from '../controllers/cropPlan.controller.js';

const router = Router();


// Listagem e busca
router.get('/', getCropPlans);
router.get('/:id', getCropPlanById);

// Criação, Edição e Exclusão
router.post('/', createCropPlan);
router.put('/:id', updateCropPlan);
router.delete('/:id', deleteCropPlan);

export default router;