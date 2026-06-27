import 'express-async-errors';
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth.js';
import {
  getExpenses, createExpense, updateExpense, deleteExpense,
  getExpenseCategories, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory,
} from './controllers/expense.controller.js';
import { getSales, createSale, updateSale, deleteSale } from './controllers/sale.controller.js';
import { getOrgSummary, getGardenSummary } from './controllers/summary.controller.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'finance-service' }));

// ─── Sumários ─────────────────────────────────────────────────────────────────
app.get('/api/finance/summary',         authenticate, getOrgSummary);
app.get('/api/finance/summary/gardens', authenticate, getGardenSummary);

// ─── Despesas ─────────────────────────────────────────────────────────────────
app.get('/api/finance/expenses',               authenticate, getExpenses);
app.post('/api/finance/expenses',              authenticate, createExpense);
app.put('/api/finance/expenses/:id',           authenticate, updateExpense);
app.delete('/api/finance/expenses/:id',        authenticate, deleteExpense);

// ─── Categorias de Despesa ────────────────────────────────────────────────────
app.get('/api/finance/expense-categories',         authenticate, getExpenseCategories);
app.post('/api/finance/expense-categories',        authenticate, createExpenseCategory);
app.put('/api/finance/expense-categories/:id',     authenticate, updateExpenseCategory);
app.delete('/api/finance/expense-categories/:id',  authenticate, deleteExpenseCategory);

// ─── Vendas / Receitas ────────────────────────────────────────────────────────
app.get('/api/finance/sales',          authenticate, getSales);
app.post('/api/finance/sales',         authenticate, createSale);
app.put('/api/finance/sales/:id',      authenticate, updateSale);
app.delete('/api/finance/sales/:id',   authenticate, deleteSale);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[finance-service] Erro:', err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Erro interno.' });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`[finance-service] Porta ${PORT}`));
