import { Request, Response } from "express";
import { prisma } from "../core/database/prisma.js";

export const startPlantingCycle = async (req: Request, res: Response) => {
  const { gardenId, cropPlanId, startDate } = req.body;
  const organizationId = req.user?.organizationId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Busca o Plano de Cultivo com tudo dentro
      const plan = await tx.cropPlan.findUnique({
        where: { id: Number(cropPlanId) },
        include: { planTasks: true, planSupplies: true }
      });

      if (!plan) throw new Error("Plano de cultivo não encontrado.");

      // 2. Calcula data de colheita
      const start = new Date(startDate);
      const harvestDate = new Date(start);
      harvestDate.setDate(start.getDate() + plan.durationDays);

      // 3. Cria o Ciclo de Cultivo
      const newCycle = await tx.cropCycle.create({
        data: {
          gardenId: Number(gardenId),
          cropPlanId: Number(cropPlanId),
          startDate: start,
          expectedHarvestDate: harvestDate,
          status: "ACTIVE",
          // Gera as tarefas específicas deste ciclo
          tasks: {
            create: plan.planTasks.map(t => ({
              title: t.title,
              dueDate: new Date(new Date(start).setDate(start.getDate() + t.dayToExecute))
            }))
          }
        }
      });

      // 4. Atualiza o status do Canteiro (Garden)
      await tx.garden.update({
        where: { id: Number(gardenId) },
        data: {
          crop: plan.culture,
          plantingDate: start,
          cropPlanId: plan.id
        }
      });

      // 5. BAIXA AUTOMÁTICA DE ESTOQUE
      for (const item of plan.planSupplies) {
        if (item.supplyId) {
          await tx.supply.update({
            where: { id: item.supplyId },
            data: { 
              quantity: { decrement: Number(item.quantity) } 
            }
          });
        }
      }

      return newCycle;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error("Erro ao iniciar ciclo:", error);
    res.status(500).json({ error: "Erro ao processar o plantio.", details: error.message });
  }
};