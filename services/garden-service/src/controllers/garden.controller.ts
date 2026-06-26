import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { publishEvent } from '../rabbitmq.js';

const generateLotCode = () => `LOT-${Date.now().toString(36).toUpperCase()}`;

export const getGardens = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const gardens = await prisma.garden.findMany({
    where: { organizationId, isActive: true },
    include: { cropPlan: true, cropCycles: { where: { status: 'ACTIVE' }, take: 1 } },
    orderBy: { name: 'asc' },
  });
  res.json(gardens);
};

export const createGarden = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { name, crop, plantingDate, sizeInM2, location, geometry, mapColor } = req.body;

  const garden = await prisma.garden.create({
    data: {
      name,
      crop,
      lotCode: generateLotCode(),
      plantingDate: plantingDate ? new Date(plantingDate) : null,
      sizeInM2: Number(sizeInM2),
      location,
      geometry,
      mapColor: mapColor || '#2e7d32',
      isActive: true,
      organizationId,
    },
  });

  await publishEvent('garden.created', {
    organizationId,
    gardenId: garden.id,
    gardenName: garden.name,
    crop: garden.crop,
  });

  res.status(201).json(garden);
};

export const updateGarden = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user!;

  const check = await prisma.garden.findFirst({ where: { id: Number(id), organizationId } });
  if (!check) return res.status(404).json({ error: 'Canteiro não encontrado.' });

  const updated = await prisma.garden.update({
    where: { id: Number(id) },
    data: req.body,
  });
  res.json(updated);
};

export const deleteGarden = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user!;

  const check = await prisma.garden.findFirst({ where: { id: Number(id), organizationId } });
  if (!check) return res.status(404).json({ error: 'Canteiro não encontrado.' });

  await prisma.garden.update({ where: { id: Number(id) }, data: { isActive: false } });
  res.status(204).send();
};

export const calculateStand = async (req: Request, res: Response) => {
  const { sizeInM2, spacingX, spacingY, germinationRate = 0.95, safetyMargin = 0.10 } = req.body;

  const baseSeeds = Number(sizeInM2) / (Number(spacingX) * Number(spacingY));
  const requiredSeeds = Math.ceil(baseSeeds / Number(germinationRate) * (1 + Number(safetyMargin)));

  res.json({
    basePlants: Math.floor(baseSeeds),
    requiredSeeds,
    germinationRate,
    safetyMargin,
  });
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;

  const [gardens, supplies, tasks, harvests] = await Promise.all([
    prisma.garden.findMany({ where: { organizationId, isActive: true }, include: { cropPlan: true } }),
    prisma.supply.findMany({ where: { organizationId } }),
    prisma.task.findMany({ where: { organizationId } }),
    prisma.harvest.findMany({ where: { garden: { organizationId } }, orderBy: { harvestDate: 'asc' } }),
  ]);

  let projectedRevenue = 0;
  let totalPlantsInGround = 0;

  gardens.forEach((g) => {
    if (g.cropPlan) {
      const sx = g.cropPlan.spacingX || 1;
      const sy = g.cropPlan.spacingY || 1;
      const plants = g.sizeInM2 / (sx * sy);
      projectedRevenue += plants * (g.cropPlan.expectedWeightPerUnit || 0) * (g.cropPlan.commercialEfficiency || 1) * (g.cropPlan.targetMarketPrice || 0);
      totalPlantsInGround += plants;
    }
  });

  const cropCounts: Record<string, number> = {};
  gardens.forEach((g) => { cropCounts[g.crop] = (cropCounts[g.crop] || 0) + 1; });

  const now = new Date();

  res.json({
    production: {
      totalGardens: gardens.length,
      totalArea: Number(gardens.reduce((s, g) => s + (g.sizeInM2 || 0), 0).toFixed(1)),
      totalPlants: Math.round(totalPlantsInGround),
      projectedRevenue: Number(projectedRevenue.toFixed(2)),
      realYieldKg: Number(harvests.reduce((s, h) => s + (h.yieldKg || 0), 0).toFixed(1)),
    },
    inventory: { lowStockAlerts: supplies.filter((s) => s.quantity <= (s.minStock || 0)).length },
    tasks: {
      pending: tasks.filter((t) => t.status === 'PENDING').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter((t) => t.status === 'DONE').length,
      overdue: tasks.filter((t) => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now).length,
      completionRate: tasks.length ? Math.round((tasks.filter((t) => t.status === 'DONE').length / tasks.length) * 100) : 0,
    },
    charts: {
      cropsDistribution: Object.keys(cropCounts).map((name) => ({ name, value: cropCounts[name] })),
      harvestHistory: harvests.map((h) => ({
        date: h.harvestDate ? new Date(h.harvestDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }).replace('.', '') : '---',
        yield: h.yieldKg || 0,
      })),
    },
  });
};

export const searchAll = async (req: Request, res: Response) => {
  const { q } = req.query as { q: string };
  const { organizationId } = req.user!;

  if (!q || q.length < 2) return res.json({ gardens: [], supplies: [], tasks: [] });

  const [gardens, supplies, tasks] = await Promise.all([
    prisma.garden.findMany({ where: { organizationId, name: { contains: q, mode: 'insensitive' } }, take: 5 }),
    prisma.supply.findMany({ where: { organizationId, name: { contains: q, mode: 'insensitive' } }, take: 5 }),
    prisma.task.findMany({ where: { organizationId, title: { contains: q, mode: 'insensitive' } }, take: 5 }),
  ]);

  res.json({ gardens, supplies, tasks });
};
