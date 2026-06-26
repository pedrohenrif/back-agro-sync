import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { publishEvent } from '../rabbitmq.js';

async function checkAndAlertLowStock(organizationId: number, supplyId: number) {
  const supply = await prisma.supply.findUnique({ where: { id: supplyId } });
  if (supply && supply.quantity <= (supply.minStock ?? 0)) {
    await publishEvent('supply.low_stock', {
      organizationId,
      supplyId: supply.id,
      supplyName: supply.name,
      currentQuantity: supply.quantity,
      minStock: supply.minStock ?? 0,
    });
  }
}

export const getSupplies = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const supplies = await prisma.supply.findMany({
    where: { organizationId, isActive: true },
    include: { category: true, unit: true },
    orderBy: { name: 'asc' },
  });
  res.json(supplies);
};

export const createSupply = async (req: Request, res: Response) => {
  const { organizationId, userId } = req.user!;
  const { name, brand, supplierLot, invoiceNumber, quantity, minStock, unitPrice, withdrawalDays, unitId, categoryId } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    const supply = await tx.supply.create({
      data: {
        name, brand, supplierLot, invoiceNumber,
        quantity: Number(quantity),
        minStock: Number(minStock || 0),
        unitPrice: unitPrice ? Number(unitPrice) : null,
        withdrawalDays: Number(withdrawalDays || 0),
        organizationId, categoryId: Number(categoryId), unitId: Number(unitId),
      },
    });
    await tx.supplyTransaction.create({
      data: {
        type: 'ENTRY', quantity: Number(quantity), reason: 'Cadastro Inicial',
        supply: { connect: { id: supply.id } },
        organization: { connect: { id: organizationId } },
        user: { connect: { id: userId } },
      },
    });
    return supply;
  });

  await checkAndAlertLowStock(organizationId, result.id);
  res.status(201).json(result);
};

export const updateSupply = async (req: Request, res: Response) => {
  const { organizationId, userId } = req.user!;
  const { id } = req.params;
  const data = req.body;

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.supply.findFirst({ where: { id: Number(id), organizationId } });
    if (!current) throw Object.assign(new Error('Insumo não encontrado.'), { statusCode: 404 });

    const updated = await tx.supply.update({
      where: { id: Number(id) },
      data: {
        name: data.name, brand: data.brand, supplierLot: data.supplierLot, invoiceNumber: data.invoiceNumber,
        quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
        minStock: data.minStock !== undefined ? Number(data.minStock) : undefined,
        unitPrice: data.unitPrice !== undefined ? Number(data.unitPrice) : undefined,
        withdrawalDays: data.withdrawalDays !== undefined ? Number(data.withdrawalDays) : undefined,
        isActive: data.isActive,
        unit: data.unitId ? { connect: { id: Number(data.unitId) } } : undefined,
        category: data.categoryId ? { connect: { id: Number(data.categoryId) } } : undefined,
      },
      include: { category: true, unit: true },
    });

    if (data.quantity !== undefined) {
      const diff = Number(data.quantity) - current.quantity;
      if (diff !== 0) {
        await tx.supplyTransaction.create({
          data: {
            type: diff > 0 ? 'ENTRY' : 'EXIT', quantity: Math.abs(diff),
            reason: data.reason || 'Ajuste manual',
            supply: { connect: { id: updated.id } },
            organization: { connect: { id: organizationId } },
            user: { connect: { id: userId } },
          },
        });
      }
    }
    return updated;
  });

  await checkAndAlertLowStock(organizationId, Number(id));
  res.json(result);
};

export const deleteSupply = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;
  const check = await prisma.supply.findFirst({ where: { id: Number(id), organizationId } });
  if (!check) return res.status(404).json({ error: 'Insumo não encontrado.' });
  const updated = await prisma.supply.update({ where: { id: Number(id) }, data: { isActive: false }, include: { category: true, unit: true } });
  res.json(updated);
};

export const getSupplyTransactions = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;
  const supply = await prisma.supply.findFirst({ where: { id: Number(id), organizationId } });
  if (!supply) return res.status(404).json({ message: 'Insumo não encontrado.' });
  const transactions = await prisma.supplyTransaction.findMany({
    where: { supplyId: Number(id), organizationId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(transactions);
};

// ── Categorias ──────────────────────────────────────────────
export const getCategories = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const cats = await prisma.supplyCategory.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
  res.json(cats);
};
export const createCategory = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { name, description } = req.body;
  const cat = await prisma.supplyCategory.create({ data: { name, description, organizationId } });
  res.status(201).json(cat);
};
export const updateCategory = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;
  const { name, description } = req.body;
  const r = await prisma.supplyCategory.updateMany({ where: { id: Number(id), organizationId }, data: { name, description } });
  if (!r.count) return res.status(404).json({ message: 'Categoria não encontrada.' });
  res.json({ message: 'Categoria atualizada.' });
};
export const deleteCategory = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;
  await prisma.supplyCategory.deleteMany({ where: { id: Number(id), organizationId } });
  res.status(204).send();
};

// ── Unidades ────────────────────────────────────────────────
export const getUnits = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const units = await prisma.supplyUnit.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
  res.json(units);
};
export const createUnit = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { name, symbol } = req.body;
  const unit = await prisma.supplyUnit.create({ data: { name, symbol, organizationId } });
  res.status(201).json(unit);
};
export const updateUnit = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;
  const { name, symbol } = req.body;
  const r = await prisma.supplyUnit.updateMany({ where: { id: Number(id), organizationId }, data: { name, symbol } });
  if (!r.count) return res.status(404).json({ message: 'Unidade não encontrada.' });
  res.json({ message: 'Unidade atualizada.' });
};
export const deleteUnit = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;
  await prisma.supplyUnit.deleteMany({ where: { id: Number(id), organizationId } });
  res.status(204).send();
};
