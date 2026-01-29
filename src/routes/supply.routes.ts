// ARQUIVO: src/routes/supply.routes.ts

import { Router } from 'express';
import { 
  createSupply, 
  deleteSupply, 
  updateSupply, 
  getCategories, 
  getSupplies,
  getUnits, 
  deleteUnit,
  createUnit,
  deleteCategory,
  createCategory,
  updateCategory,
  updateUnit
} from '../controllers/supply.controller.js';

const router = Router();


// Rotas de Insumos
router.get('/', getSupplies);
router.post('/', createSupply);
router.put('/:id', updateSupply);
router.delete('/:id', deleteSupply); 

// Rotas de Categorias
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);
router.put("/categories/:id", updateCategory);
// Rotas de Unidades
router.get("/units", getUnits);
router.post("/units", createUnit);
router.delete("/units/:id", deleteUnit);
router.put("/units/:id", updateUnit);

export default router;