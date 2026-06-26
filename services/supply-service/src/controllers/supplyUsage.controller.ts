import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { publishEvent } from '../rabbitmq.js';

export const applySupplyToGarden = async (req: Request, res: Response) => {
  const { gardenId, supplyId, quantityApplied, notes } = req.body;
  const { organizationId, userId } = req.user!;

  if (!gardenId || !supplyId || !quantityApplied) {
    return res.status(400).json({ error: 'Dados incompletos para aplicação.' });
  }

  const result = await prisma.$transaction(async (tx) => {
    const supply = await tx.supply.findFirst({ where: { id: Number(supplyId), organizationId } });
    if (!supply) throw new Error('Insumo não encontrado no estoque.');
    if (supply.quantity < Number(quantityApplied)) {
      throw Object.assign(new Error(`Estoque insuficiente. Disponível: ${supply.quantity}`), { statusCode: 400 });
    }

    const usage = await tx.supplyUsage.create({
      data: {
        quantityUsed: Number(quantityApplied),
        usedAt: new Date(),
        notes: notes || `Aplicação manual via painel.`,
        gardenId: Number(gardenId), supplyId: Number(supplyId), organizationId,
      },
      include: { supply: { select: { name: true } } },
    });

    await tx.supplyTransaction.create({
      data: {
        type: 'EXIT', quantity: Number(quantityApplied),
        reason: notes || `Aplicação no canteiro #${gardenId}`,
        supply: { connect: { id: Number(supplyId) } },
        organization: { connect: { id: organizationId } },
        user: { connect: { id: userId } },
      },
    });

    const updatedSupply = await tx.supply.update({
      where: { id: Number(supplyId) },
      data: { quantity: { decrement: Number(quantityApplied) } },
    });

    return { usage, updatedSupply };
  });

  // Verifica estoque baixo após a aplicação
  if (result.updatedSupply.quantity <= (result.updatedSupply.minStock ?? 0)) {
    await publishEvent('supply.low_stock', {
      organizationId,
      supplyId: result.updatedSupply.id,
      supplyName: result.updatedSupply.name,
      currentQuantity: result.updatedSupply.quantity,
      minStock: result.updatedSupply.minStock ?? 0,
    });
  }

  res.status(201).json({ message: 'Aplicação registrada e estoque atualizado!', data: result.usage });
};

export const getGardenUsageHistory = async (req: Request, res: Response) => {
  const { gardenId } = req.params;
  const { organizationId } = req.user!;
  const history = await prisma.supplyUsage.findMany({
    where: { gardenId: Number(gardenId), organizationId },
    include: { supply: { include: { unit: true } } },
    orderBy: { usedAt: 'desc' },
  });
  res.json(history);
};
