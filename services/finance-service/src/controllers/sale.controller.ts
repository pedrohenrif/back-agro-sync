import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const getSales = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { gardenId, from, to } = req.query;

  const where: any = { organizationId };
  if (gardenId) where.gardenId = Number(gardenId);
  if (from || to) {
    where.saleDate = {};
    if (from) where.saleDate.gte = new Date(String(from));
    if (to) where.saleDate.lte = new Date(String(to));
  }

  const sales = await prisma.harvestSale.findMany({ where, orderBy: { saleDate: 'desc' } });
  res.json(sales);
};

export const createSale = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { gardenId, quantityKg, pricePerKg, buyer, saleDate, notes } = req.body;

  const qty = Number(quantityKg);
  const price = Number(pricePerKg);

  const sale = await prisma.harvestSale.create({
    data: {
      organizationId,
      gardenId: Number(gardenId),
      quantityKg: qty,
      pricePerKg: price,
      totalAmount: qty * price,
      buyer: buyer || null,
      saleDate: new Date(saleDate),
      notes: notes || null,
    },
  });
  res.status(201).json(sale);
};

export const updateSale = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;
  const { quantityKg, pricePerKg, buyer, saleDate, notes } = req.body;

  const existing = await prisma.harvestSale.findFirst({ where: { id: Number(id), organizationId } });
  if (!existing) { res.status(404).json({ message: 'Venda não encontrada.' }); return; }

  const qty = quantityKg ? Number(quantityKg) : existing.quantityKg;
  const price = pricePerKg ? Number(pricePerKg) : existing.pricePerKg;

  const sale = await prisma.harvestSale.update({
    where: { id: Number(id) },
    data: {
      quantityKg: qty,
      pricePerKg: price,
      totalAmount: qty * price,
      buyer: buyer !== undefined ? buyer : undefined,
      saleDate: saleDate ? new Date(saleDate) : undefined,
      notes: notes !== undefined ? notes : undefined,
    },
  });
  res.json(sale);
};

export const deleteSale = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { id } = req.params;

  const existing = await prisma.harvestSale.findFirst({ where: { id: Number(id), organizationId } });
  if (!existing) { res.status(404).json({ message: 'Venda não encontrada.' }); return; }

  await prisma.harvestSale.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
