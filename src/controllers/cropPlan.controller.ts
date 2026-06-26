import { Request, Response } from 'express';
import { prisma } from "../core/database/prisma.js";

// --- LISTAR TODOS OS PLANOS ---
export const getCropPlans = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;

  try {
    const plans = await prisma.cropPlan.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
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

// --- BUSCAR UM PLANO ESPECÍFICO ---
export const getCropPlanById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  try {
    const plan = await prisma.cropPlan.findFirst({
      where: { 
        id: Number(id),
        organizationId 
      },
      include: {
        planTasks: true,
        planSupplies: true
      }
    });

    if (!plan) return res.status(404).json({ error: "Plano não encontrado." });
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar detalhes do plano." });
  }
};

export const createCropPlan = async (req: Request, res: Response) => {
  const { name, culture, durationDays, description, planSupplies, planTasks } = req.body;
  const organizationId = req.user?.organizationId;

  try {
    const newPlan = await prisma.cropPlan.create({
      data: {
        name,
        culture,
        durationDays: Number(durationDays),
        description: description || null, 
        organizationId: Number(organizationId),

        bestMonths: [], 
        
        planSupplies: {
          create: planSupplies.map((s: any) => ({
            name: s.name,
            quantity: Number(s.quantity),
            unit: s.unit,
            supplyId: s.supplyId ? Number(s.supplyId) : null
          }))
        },
        planTasks: {
          create: planTasks.map((t: any) => ({
            title: t.title,
            dayToExecute: Number(t.dayToExecute),
            instructions: t.instructions || ""
          }))
        }
      },
      include: {
        planSupplies: true,
        planTasks: true
      }
    });

    res.status(201).json(newPlan);
  } catch (error: any) {
    console.error("ERRO NO PRISMA (CREATE):", error);
    res.status(500).json({ error: 'Erro ao salvar plano.', details: error.message });
  }
};

export const updateCropPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, culture, durationDays, description, planSupplies, planTasks } = req.body;

    const updatedPlan = await prisma.cropPlan.update({
      where: { id: Number(id) },
      data: {
        name,
        culture,
        durationDays: Number(durationDays),
        description,
        planSupplies: {
          deleteMany: {}, // Limpa os antigos
          create: planSupplies.map((s: any) => ({
            name: s.name,
            quantity: Number(s.quantity),
            unit: s.unit,
            supplyId: s.supplyId ? Number(s.supplyId) : null
          }))
        },
        planTasks: {
          deleteMany: {}, // Limpa as antigas
          create: planTasks.map((t: any) => ({
            title: t.title,
            dayToExecute: Number(t.dayToExecute),
            instructions: t.instructions || ""
          }))
        }
      }
    });

    res.json(updatedPlan);
  } catch (error: any) {
    console.error("ERRO NO PRISMA (UPDATE):", error);
    res.status(500).json({ error: 'Erro ao atualizar plano.' });
  }
};

// --- EXCLUIR PLANO ---
export const deleteCropPlan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  try {
    const check = await prisma.cropPlan.findFirst({
      where: { id: Number(id), organizationId }
    });

    if (!check) return res.status(404).json({ error: "Plano não encontrado." });

    await prisma.cropPlan.delete({
      where: { id: Number(id) }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir plano." });
  }
};