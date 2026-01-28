// ARQUIVO: src/routes/supply.routes.ts

import { Router } from 'express';
import { 
  createSupply, 
  deleteSupply, 
  updateSupply, 
  getCategories, 
  getSupplies,
  getUnits 
} from '../controllers/supply.controller.js';

const router = Router();

router.get('/', getSupplies);
router.post('/', createSupply);

router.put('/:id', updateSupply);
router.delete('/:id', deleteSupply); 

router.get('/categories', getCategories);
router.get('/units', getUnits);

export default router;