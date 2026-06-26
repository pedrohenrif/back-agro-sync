import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { publishEvent } from '../rabbitmq.js';

export const recordHarvest = async (req: Request, res: Response) => {
  const { gardenId, yieldKg, harvestDate, notes, isFinalHarvest } = req.body;
  const { organizationId } = req.user!;

  const garden = await prisma.garden.findFirst({ where: { id: Number(gardenId), organizationId } });
  if (!garden) return res.status(404).json({ error: 'Canteiro não encontrado.' });

  const result = await prisma.$transaction(async (tx) => {
    const harvest = await tx.harvest.create({
      data: {
        yieldKg: parseFloat(yieldKg),
        harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
        notes: notes || 'Colheita realizada.',
        gardenId: Number(gardenId),
      },
    });
    if (isFinalHarvest) {
      await tx.garden.update({ where: { id: Number(gardenId) }, data: { isActive: false } });
    }
    return harvest;
  });

  await publishEvent('harvest.recorded', {
    organizationId,
    gardenId: Number(gardenId),
    yieldKg: parseFloat(yieldKg),
    harvestDate: result.harvestDate.toISOString(),
  });

  res.status(201).json({ message: 'Colheita registrada!', data: result });
};

export const getHarvestHistory = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const harvests = await prisma.harvest.findMany({
    where: { garden: { organizationId } },
    include: { garden: { select: { name: true, crop: true, lotCode: true } } },
    orderBy: { harvestDate: 'desc' },
  });
  res.json(harvests);
};

export const getHarvestsByGarden = async (req: Request, res: Response) => {
  const { gardenId } = req.params;
  const { organizationId } = req.user!;
  const harvests = await prisma.harvest.findMany({
    where: { gardenId: Number(gardenId), garden: { organizationId } },
    orderBy: { harvestDate: 'desc' },
  });
  res.json(harvests);
};
