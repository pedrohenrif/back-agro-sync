import { Router } from 'express';
import { createSupply, deleteSupply, updateSupply, getCategories, getSupplys } from '../controllers/supply.controller.js';

const router = Router();


router.get('/get-supplys', getSupplys);

router.post('/add', createSupply);

router.put('/delete/:id', deleteSupply);

router.put('/update/:id', updateSupply);

router.get('/get-categories', getCategories);

export default router;
