import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { publishEvent } from '../rabbitmq.js';

export const startPlantingCycle = async (req: Request, res: Response) => {
  const { gardenId, cropPlanId, startDate } = req.body;
  const { organizationId } = req.user!;

  const result = await prisma.$transaction(async (tx) => {
    const plan = await tx.cropPlan.findUnique({
      where: { id: Number(cropPlanId) },
      include: { planTasks: true, planSupplies: true },
    });
    if (!plan) throw new Error('Plano de cultivo não encontrado.');

    const start = new Date(startDate);
    const expectedHarvestDate = new Date(start);
    expectedHarvestDate.setDate(start.getDate() + plan.durationDays);

    const cycle = await tx.cropCycle.create({
      data: {
        gardenId: Number(gardenId),
        cropPlanId: Number(cropPlanId),
        startDate: start,
        expectedHarvestDate,
        status: 'ACTIVE',
        tasks: {
          create: plan.planTasks.map((t) => ({
            title: t.title,
            dueDate: new Date(new Date(start).setDate(start.getDate() + t.dayToExecute)),
          })),
        },
      },
    });

    await tx.garden.update({
      where: { id: Number(gardenId) },
      data: { crop: plan.culture, plantingDate: start, cropPlanId: plan.id },
    });

    // Baixa automática de estoque dos insumos do plano
    for (const item of plan.planSupplies) {
      if (item.supplyId) {
        await tx.supply.update({
          where: { id: item.supplyId },
          data: { quantity: { decrement: Number(item.quantity) } },
        });
      }
    }

    return { cycle, plan, expectedHarvestDate };
  });

  // Emite evento para outros serviços reagirem
  await publishEvent('crop_cycle.started', {
    organizationId,
    gardenId: Number(gardenId),
    cropPlanId: Number(cropPlanId),
    planName: result.plan.name,
    startDate: result.cycle.startDate.toISOString(),
    expectedHarvestDate: result.expectedHarvestDate.toISOString(),
  });

  res.status(201).json(result.cycle);
};
