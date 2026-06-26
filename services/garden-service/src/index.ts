import 'express-async-errors';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth.js';
import {
  getGardens, createGarden, updateGarden, deleteGarden, calculateStand,
  getDashboardStats, searchAll,
} from './controllers/garden.controller.js';
import { startPlantingCycle } from './controllers/cropCycle.controller.js';
import { getCropPlans, getCropPlanById, createCropPlan, updateCropPlan, deleteCropPlan } from './controllers/cropPlan.controller.js';
import { recordHarvest, getHarvestHistory, getHarvestsByGarden } from './controllers/harvest.controller.js';
import { createJournalEntry, getJournalByGarden } from './controllers/journal.controller.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'garden-service' }));

// Gardens
app.get('/api/gardens',               authenticate, getGardens);
app.post('/api/gardens',              authenticate, createGarden);
app.put('/api/gardens/:id',           authenticate, updateGarden);
app.delete('/api/gardens/:id',        authenticate, deleteGarden);
app.post('/api/gardens/calculate-stand', authenticate, calculateStand);

// Crop Plans
app.get('/api/crop-plans',            authenticate, getCropPlans);
app.get('/api/crop-plans/:id',        authenticate, getCropPlanById);
app.post('/api/crop-plans',           authenticate, createCropPlan);
app.put('/api/crop-plans/:id',        authenticate, updateCropPlan);
app.delete('/api/crop-plans/:id',     authenticate, deleteCropPlan);

// Crop Cycles
app.post('/api/crop-cycles',          authenticate, startPlantingCycle);

// Harvests
app.post('/api/harvest',              authenticate, recordHarvest);
app.get('/api/harvest',               authenticate, getHarvestHistory);
app.get('/api/harvest/garden/:gardenId', authenticate, getHarvestsByGarden);

// Journal
app.post('/api/journals',             authenticate, createJournalEntry);
app.get('/api/journals/garden/:gardenId', authenticate, getJournalByGarden);

// Dashboard & Search
app.get('/api/dashboard/stats',       authenticate, getDashboardStats);
app.get('/api/search',                authenticate, searchAll);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[garden-service] Erro:', err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Erro interno.' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`[garden-service] Porta ${PORT}`));
