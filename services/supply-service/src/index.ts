import 'express-async-errors';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth.js';
import {
  getSupplies, createSupply, updateSupply, deleteSupply, getSupplyTransactions,
  getCategories, createCategory, updateCategory, deleteCategory,
  getUnits, createUnit, updateUnit, deleteUnit,
} from './controllers/supply.controller.js';
import { applySupplyToGarden, getGardenUsageHistory } from './controllers/supplyUsage.controller.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'supply-service' }));

// Supplies
app.get('/api/supplies',                    authenticate, getSupplies);
app.post('/api/supplies',                   authenticate, createSupply);
app.put('/api/supplies/:id',                authenticate, updateSupply);
app.delete('/api/supplies/:id',             authenticate, deleteSupply);
app.get('/api/supplies/:id/transactions',   authenticate, getSupplyTransactions);

// Categories
app.get('/api/supplies/categories',         authenticate, getCategories);
app.post('/api/supplies/categories',        authenticate, createCategory);
app.put('/api/supplies/categories/:id',     authenticate, updateCategory);
app.delete('/api/supplies/categories/:id',  authenticate, deleteCategory);

// Units
app.get('/api/supplies/units',              authenticate, getUnits);
app.post('/api/supplies/units',             authenticate, createUnit);
app.put('/api/supplies/units/:id',          authenticate, updateUnit);
app.delete('/api/supplies/units/:id',       authenticate, deleteUnit);

// Usage
app.post('/api/usage/apply',                authenticate, applySupplyToGarden);
app.get('/api/usage/history/:gardenId',     authenticate, getGardenUsageHistory);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[supply-service] Erro:', err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Erro interno.' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`[supply-service] Porta ${PORT}`));
