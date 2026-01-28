import { Request, Response } from 'express';
import { prisma } from "../../prisma/config/prisma.js";

export const getCropPlans = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;

  try {
    const plans = await prisma.cropPlan.findMany({
      where: {
        organizationId: organizationId
      },
      orderBy: {
        name: 'asc'
      },
      include: {
        planTasks: true,
        planSupplies: true
      }
    });

    res.json(plans);
  } catch (error) {
    console.error("Erro ao buscar planos de cultivo:", error);
    res.status(500).json({ error: "Erro ao carregar planos de cultivo." });
  }
};

export const getCropPlanById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const plan = await prisma.cropPlan.findUnique({
      where: { id: Number(id) },
      include: {
        planTasks: true,
        planSupplies: true
      }
    });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar detalhes do plano." });
  }
};