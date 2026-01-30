import { Request, Response } from 'express';
import { prisma } from "../../prisma/config/prisma.js";


export const applySupplyToGarden = async (req: Request, res: Response) => {
  const { gardenId, supplyId, quantityApplied, notes } = req.body;
  const organizationId = req.user!.organizationId;
  const userId = req.user!.userId; 

  if (!gardenId || !supplyId || !quantityApplied) {
    return res.status(400).json({ error: "Dados incompletos para aplicação." });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      
      const supply = await tx.supply.findFirst({
        where: { id: Number(supplyId), organizationId }
      });

      if (!supply) {
        throw new Error("Insumo não encontrado no estoque.");
      }

      if (supply.quantity < Number(quantityApplied)) {
        throw new Error(`Estoque insuficiente. Disponível: ${supply.quantity}`);
      }

      const usage = await tx.supplyUsage.create({
        data: {
          quantityUsed: Number(quantityApplied),
          usedAt: new Date(), 
          notes: notes || `Aplicação manual via painel do canteiro.`,
          gardenId: Number(gardenId),
          supplyId: Number(supplyId),
          organizationId
        },
        include: {
          supply: { select: { name: true } }
        }
      });

      await tx.supplyTransaction.create({
        data: {
          type: 'EXIT',
          quantity: Number(quantityApplied),
          reason: notes || `Aplicação no canteiro #${gardenId}`,
          supply: { connect: { id: Number(supplyId) } },
          organization: { connect: { id: Number(organizationId) } },
          user: { connect: { id: Number(userId) } }
        }
      });

      await tx.supply.update({
        where: { id: Number(supplyId) },
        data: {
          quantity: {
            decrement: Number(quantityApplied)
          }
        }
      });

      return usage;
    });

    res.status(201).json({
      message: "Aplicação registrada e estoque atualizado com sucesso!",
      data: result
    });

  } catch (error: any) {
    console.error("Erro na aplicação de insumo:", error.message);
    res.status(400).json({ error: error.message || "Erro ao processar aplicação." });
  }
};

export const getGardenUsageHistory = async (req: Request, res: Response) => {
  const { gardenId } = req.params;
  const organizationId = req.user!.organizationId;

  try {
    const history = await prisma.supplyUsage.findMany({
      where: { 
        gardenId: Number(gardenId),
        organizationId: organizationId 
      },
      include: {
        supply: {
          include: { 
            unit: true 
          }
        }
      },
      orderBy: {
        usedAt: "desc" 
      }
    });

    res.json(history);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro ao buscar histórico de insumos." });
  }
};