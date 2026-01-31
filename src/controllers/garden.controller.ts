// ARQUIVO: src/controllers/garden.controller.ts

import { Request, Response } from "express";
import { prisma } from "../../prisma/config/prisma.js"; 

export const getGardens = async (req: Request, res: Response) => {
  try {
    const organizationId = req.user!.organizationId;

    const gardens = await prisma.garden.findMany({
      where: {
        organizationId: organizationId,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(gardens);
  } catch (error) {
    console.error("Erro ao buscar canteiros:", error);
    res.status(500).json({ message: "Erro ao buscar canteiros." });
  }
};

export const createGarden = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { name, crop, plantingDate, sizeInM2, cropPlanId, location } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Tratamento da Sigla e Código de Lote
      const cropName = crop || "Vazio";
      const sigla = cropName.length >= 3 ? cropName.substring(0, 3).toUpperCase() : "VAZ";
      const year = new Date().getFullYear();
      const random = Math.random().toString(36).substring(7).toUpperCase();
      const generatedLotCode = `${sigla}-${year}-${random}`;

      // 2. Tratamento da Data (Para aceitar canteiro vazio)
      const parsedPlantingDate = plantingDate ? new Date(plantingDate) : undefined;

      // 3. Criação do Canteiro
      const newGarden = await tx.garden.create({
        data: {
          name,
          lotCode: generatedLotCode,
          crop: cropName,
          plantingDate: parsedPlantingDate,
          sizeInM2: parseFloat(sizeInM2) || 0,
          location: location || "",
          
          // CORREÇÃO AQUI: Em vez de cropPlanId, usamos o objeto de relação cropPlan
          // Se houver ID, conectamos. Se não, deixamos undefined (não preenche).
          cropPlan: cropPlanId ? {
            connect: { id: Number(cropPlanId) }
          } : undefined,

          organization: {
            connect: { id: Number(organizationId) }
          }
        }
      });

      // 4. Geração Automática de Tarefas (Se houver plano e data)
      if (cropPlanId && parsedPlantingDate) {
        const planTasks = await tx.planTask.findMany({
          where: { cropPlanId: Number(cropPlanId) }
        });

        if (planTasks.length > 0) {
          const tasksToCreate = planTasks.map(pt => {
            const dueDate = new Date(parsedPlantingDate);
            dueDate.setDate(dueDate.getDate() + pt.dayToExecute); 

            return {
              title: `${pt.title} (${newGarden.name})`,
              description: pt.instructions || `Tarefa automática para ${cropName}`,
              status: 'PENDING',
              priority: 'MEDIUM',
              dueDate: dueDate,
              gardenId: newGarden.id,
              organizationId: Number(organizationId)
            };
          });

          await tx.task.createMany({
            data: tasksToCreate
          });
        }
      }

      return newGarden;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error("Erro ao criar canteiro e tarefas:", error);
    res.status(500).json({ 
      error: "Erro ao processar o plantio e agendar tarefas.",
      details: error.message 
    });
  }
};

export const updateGarden = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { id } = req.params; 
  const { name, crop, plantingDate, sizeInM2, location, isActive } = req.body;

  try {
    const garden = await prisma.garden.findFirst({
      where: {
        id: Number(id),
        organizationId: organizationId, 
      }
    });

    if (!garden) {
      return res.status(404).json({ message: "Canteiro não encontrado ou acesso negado." });
    }

    const updatedGarden = await prisma.garden.update({
      where: { id: Number(id) },
      data: {
        name,
        crop,
        plantingDate: plantingDate ? new Date(plantingDate) : undefined,
        sizeInM2,
        location,
        isActive,
      },
    });
    res.status(200).json(updatedGarden);
  } catch (error) {
    console.error("Erro ao atualizar canteiro:", error);
    res.status(500).json({ message: "Erro ao atualizar canteiro." });
  }
};

export const deleteGarden = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { id } = req.params;

  try {
    const garden = await prisma.garden.findFirst({
      where: {
        id: Number(id),
        organizationId: organizationId,
      }
    });

    if (!garden) {
      return res.status(404).json({ message: "Canteiro não encontrado ou acesso negado." });
    }

    await prisma.garden.delete({
      where: { id: Number(id) },
    });
    res.status(204).send(); 
  } catch (error) {
    console.error("Erro ao deletar canteiro:", error);
    res.status(500).json({ message: "Erro ao deletar canteiro." });
  }
};

export const calculatePlantingStand = async (req: Request, res: Response) => {
  const { areaM2, cropPlanId } = req.body;

  try {
    const plan = await prisma.cropPlan.findUnique({
      where: { id: Number(cropPlanId) }
    });

    if (!plan || !plan.spacingX || !plan.spacingY) {
      return res.status(400).json({ error: "Plano de cultivo sem dados de espaçamento." });
    }

    const baseStand = areaM2 / (plan.spacingX * plan.spacingY);
    
    const germination = plan.germinationRate || 0.95;
    const safety = 1 + (plan.safetyMargin || 0.10);
    const totalSeeds = (baseStand / germination) * safety;

    const expectedYield = baseStand * (plan.expectedWeightPerUnit || 0) * (plan.commercialEfficiency || 0.85);

    res.json({
      baseStand: Math.round(baseStand),
      requiredSeeds: Math.ceil(totalSeeds),
      expectedYieldKg: Number(expectedYield.toFixed(2)),
      recommendation: `Para esta área, sugerimos a compra de ${Math.ceil(totalSeeds)} sementes.`
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao calcular estande." });
  }
};