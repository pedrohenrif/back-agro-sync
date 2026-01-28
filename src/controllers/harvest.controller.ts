// src/controllers/harvest.controller.ts
import { Request, Response } from 'express';
import { prisma } from "../../prisma/config/prisma.js";

export const recordHarvest = async (req: Request, res: Response) => {
  const { gardenId, yieldKg, harvestDate, notes, isFinalHarvest } = req.body;
  const organizationId = req.user!.organizationId;

  try {
    // 1. Validar se o canteiro existe e pertence à organização do usuário
    const garden = await prisma.garden.findFirst({
      where: { id: Number(gardenId), organizationId }
    });

    if (!garden) {
      return res.status(404).json({ error: "Canteiro não encontrado." });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 2. Criar o registro da colheita
      const harvest = await tx.harvest.create({
        data: {
          yieldKg: parseFloat(yieldKg),
          harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
          notes: notes || "Colheita realizada.",
          gardenId: Number(gardenId),
        }
      });

      // 3. Se for a colheita final, o canteiro fica inativo
      if (isFinalHarvest) {
        await tx.garden.update({
          where: { id: Number(gardenId) },
          data: { isActive: false }
        });
      }

      return harvest;
    });

    res.status(201).json({ message: "Colheita registrada!", data: result });
  } catch (error: any) {
    console.error("Erro ao colher:", error);
    // Aqui capturamos o erro real para te ajudar no terminal
    res.status(500).json({ error: error.message || "Erro interno ao registrar colheita." });
  }
};

export const getHarvestHistory = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;

  try {
    const harvests = await prisma.harvest.findMany({
      where: {
        garden: { organizationId }
      },
      include: {
        garden: { select: { name: true, crop: true, lotCode: true } }
      },
      orderBy: { harvestDate: 'desc' }
    });
    res.json(harvests);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar histórico de colheitas." });
  }
};

export const getHarvestsByGarden = async (req: Request, res: Response) => {
  const { gardenId } = req.params;
  const organizationId = req.user!.organizationId;

  try {
    const harvests = await prisma.harvest.findMany({
      where: {
        gardenId: Number(gardenId),
        garden: { organizationId } 
      },
      orderBy: { harvestDate: 'desc' }
    });

    res.json(harvests);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar histórico de colheitas." });
  }
};