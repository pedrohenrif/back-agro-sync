import { Router } from 'express';
import { createSupply, deleteSupply, updateSupply } from '../controllers/supply.controller.js';

const router = Router();


router.post('/add', (req, res) => {
    createSupply(req, res)
});

router.put('/delete/:id', (req, res) => {
    deleteSupply(req, res)
});

router.put('/update/:id', (req, res) => {
    updateSupply(req, res)
});

export default router;
