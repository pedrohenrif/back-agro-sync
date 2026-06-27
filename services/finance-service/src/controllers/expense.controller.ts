import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const getExpenses = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { gardenId, type, from, to } = req.query;

  const where: any = { organizationId };
  if (gardenId) where.gardenId = Number(gardenId);
  if (type) where.type = String(type);
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(String(from));
    if (to) where.date.lte = new Date(String(to));
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'desc' },
  });
  res.json(expenses);
};

export const createExpense = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { gardenId, categoryId, description, amount, date, type, notes } = req.body;

  const expense = await prisma.expense.create({
    data: {
      organizationId,
      gardenId: gardenId ? Number(gardenId) : null,
      categoryId: Number(categoryId),
      description: String(description),
      amount: Number(amount),
      date: new Date(date),
      type: type || 'OTHER',
      notes: notes || null,
    },
    include: { category: true },
  });
  res.status(201).json(expense);
};

export const updateExpense = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;
  const { gardenId, categoryId, description, amount, date, type, notes } = req.body;

  const existing = await prisma.expense.findFirst({ where: { id: Number(id), organizationId } });
  if (!existing) { res.status(404).json({ message: 'Despesa não encontrada.' }); return; }

  const expense = await prisma.expense.update({
    where: { id: Number(id) },
    data: {
      gardenId: gardenId ? Number(gardenId) : null,
      categoryId: categoryId ? Number(categoryId) : undefined,
      description: description ? String(description) : undefined,
      amount: amount ? Number(amount) : undefined,
      date: date ? new Date(date) : undefined,
      type: type || undefined,
      notes: notes !== undefined ? notes : undefined,
    },
    include: { category: true },
  });
  res.json(expense);
};

export const deleteExpense = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;

  const existing = await prisma.expense.findFirst({ where: { id: Number(id), organizationId } });
  if (!existing) { res.status(404).json({ message: 'Despesa não encontrada.' }); return; }

  await prisma.expense.delete({ where: { id: Number(id) } });
  res.status(204).send();
};

// ─── Expense Categories ───────────────────────────────────────────────────────

export const getExpenseCategories = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const categories = await prisma.expenseCategory.findMany({
    where: { organizationId },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
};

export const createExpenseCategory = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { name, color } = req.body;
  const category = await prisma.expenseCategory.create({
    data: { organizationId, name: String(name), color: color || '#64748b' },
  });
  res.status(201).json(category);
};

export const updateExpenseCategory = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;
  const { name, color } = req.body;

  const existing = await prisma.expenseCategory.findFirst({ where: { id: Number(id), organizationId } });
  if (!existing) { res.status(404).json({ message: 'Categoria não encontrada.' }); return; }

  const category = await prisma.expenseCategory.update({
    where: { id: Number(id) },
    data: { name: name ? String(name) : undefined, color: color || undefined },
  });
  res.json(category);
};

export const deleteExpenseCategory = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;

  const existing = await prisma.expenseCategory.findFirst({ where: { id: Number(id), organizationId } });
  if (!existing) { res.status(404).json({ message: 'Categoria não encontrada.' }); return; }

  await prisma.expenseCategory.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
