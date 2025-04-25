import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardStats.controller.js';

const router = Router();

router.get("/get-data-dashboard/:userId", (req, res) =>{
    getDashboardStats(req, res)
});

export default router