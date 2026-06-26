import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const getCropPlans = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const plans = await prisma.cropPlan.findMany({
    where: { organizationId },
    orderBy: { name: 'asc' },
    include: { planTasks: true, planSupplies: true },
  });
  res.json(plans);
};

export const getCropPlanById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user!;
  const plan = await prisma.cropPlan.findFirst({
    where: { id: Number(id), organizationId },
    include: { planTasks: true, planSupplies: true },
  });
  if (!plan) return res.status(404).json({ error: 'Plano não encontrado.' });
  res.json(plan);
};

export const createCropPlan = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { name, culture, durationDays, description, planSupplies = [], planTasks = [], ...rest } = req.body;

  const plan = await prisma.cropPlan.create({
    data: {
      name, culture, durationDays: Number(durationDays), description: description || null,
      organizationId,
      bestMonths: rest.bestMonths || [],
      spacingX: rest.spacingX ? Number(rest.spacingX) : null,
      spacingY: rest.spacingY ? Number(rest.spacingY) : null,
      germinationRate: rest.germinationRate ? Number(rest.germinationRate) : 0.95,
      safetyMargin: rest.safetyMargin ? Number(rest.safetyMargin) : 0.10,
      expectedWeightPerUnit: rest.expectedWeightPerUnit ? Number(rest.expectedWeightPerUnit) : null,
      commercialEfficiency: rest.commercialEfficiency ? Number(rest.commercialEfficiency) : 0.85,
      targetMarketPrice: rest.targetMarketPrice ? Number(rest.targetMarketPrice) : null,
      planSupplies: {
        create: planSupplies.map((s: any) => ({
          name: s.name, quantity: Number(s.quantity), unit: s.unit,
          supplyId: s.supplyId ? Number(s.supplyId) : null,
        })),
      },
      planTasks: {
        create: planTasks.map((t: any) => ({
          title: t.title, dayToExecute: Number(t.dayToExecute), instructions: t.instructions || '',
        })),
      },
    },
    include: { planSupplies: true, planTasks: true },
  });

  res.status(201).json(plan);
};

export const updateCropPlan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, culture, durationDays, description, planSupplies = [], planTasks = [] } = req.body;

  const updated = await prisma.cropPlan.update({
    where: { id: Number(id) },
    data: {
      name, culture, durationDays: Number(durationDays), description,
      planSupplies: {
        deleteMany: {},
        create: planSupplies.map((s: any) => ({
          name: s.name, quantity: Number(s.quantity), unit: s.unit,
          supplyId: s.supplyId ? Number(s.supplyId) : null,
        })),
      },
      planTasks: {
        deleteMany: {},
        create: planTasks.map((t: any) => ({
          title: t.title, dayToExecute: Number(t.dayToExecute), instructions: t.instructions || '',
        })),
      },
    },
  });
  res.json(updated);
};

export const deleteCropPlan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user!;
  const check = await prisma.cropPlan.findFirst({ where: { id: Number(id), organizationId } });
  if (!check) return res.status(404).json({ error: 'Plano não encontrado.' });
  await prisma.cropPlan.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
