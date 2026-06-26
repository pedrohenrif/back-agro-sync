import { Request, Response } from 'express';
import { prisma } from "../core/database/prisma.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    return res.status(401).json({ error: "Organização não identificada." });
  }

  try {
    const [gardens, supplies, tasks, harvests] = await Promise.all([
      prisma.garden.findMany({ 
        where: { organizationId, isActive: true },
        include: { cropPlan: true } 
      }),
      prisma.supply.findMany({ 
        where: { organizationId } 
      }),
      prisma.task.findMany({ where: { organizationId } }),
      prisma.harvest.findMany({
        where: { garden: { organizationId } },
        orderBy: { harvestDate: 'asc' }
      })
    ]);

    // --- 1. CÁLCULOS FINANCEIROS E DE PROJEÇÃO (FUTURO) ---
    let projectedRevenue = 0;
    let totalPlantsInGround = 0;

    gardens.forEach(g => {
      if (g.cropPlan) {
        const sx = g.cropPlan.spacingX || 1;
        const sy = g.cropPlan.spacingY || 1;
        const weight = g.cropPlan.expectedWeightPerUnit || 0;
        const efficiency = g.cropPlan.commercialEfficiency || 0;
        const price = g.cropPlan.targetMarketPrice || 0;

        const plants = g.sizeInM2 / (sx * sy);
        const revenue = plants * weight * efficiency * price;
        
        projectedRevenue += revenue;
        totalPlantsInGround += plants;
      }
    });

    // --- 2. CÁLCULO DE PRODUÇÃO REAL (TOTAL ACUMULADO) ---
    const totalHarvestedKg = harvests.reduce((sum, h) => sum + (h.yieldKg || 0), 0);

    // --- 3. DISTRIBUIÇÃO DE CULTURAS (PIE CHART) ---
    const cropCounts: Record<string, number> = {};
    gardens.forEach(g => { cropCounts[g.crop] = (cropCounts[g.crop] || 0) + 1; });
    
    const cropsDistribution = Object.keys(cropCounts).map(name => ({
      name,
      value: cropCounts[name]
    }));

    // --- 4. HISTÓRICO DE COLHEITA (LINE/BAR CHART) ---
    // Restaurado para usar 'date' e 'yield' para não quebrar o seu Frontend
    const harvestHistory = harvests.map(h => ({
      date: h.harvestDate 
        ? new Date(h.harvestDate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }).replace('.', '')
        : '---',
      yield: h.yieldKg || 0
    }));

    // --- 5. DADOS DE TAREFAS ---
    const now = new Date();
    const tasksData = {
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'DONE').length,
      overdue: tasks.filter(t => 
        t.status !== 'DONE' && 
        t.dueDate && 
        new Date(t.dueDate) < now
      ).length,
    };

    // --- RESPOSTA FINAL CONSOLIDADA ---
    res.json({
      production: {
        totalGardens: gardens.length,
        totalArea: Number(gardens.reduce((sum, g) => sum + (g.sizeInM2 || 0), 0).toFixed(1)),
        totalPlants: Math.round(totalPlantsInGround),
        projectedRevenue: Number(projectedRevenue.toFixed(2)),
        realYieldKg: Number(totalHarvestedKg.toFixed(1)) // Métrica de produção real
      },
      inventory: {
        lowStockAlerts: supplies.filter(s => s.quantity <= (s.minStock || 0)).length,
      },
      tasks: {
        ...tasksData,
        completionRate: tasks.length > 0 ? Math.round((tasksData.completed / tasks.length) * 100) : 0
      },
      charts: {
        cropsDistribution,
        harvestHistory // Agora com as chaves corretas para o gráfico
      }
    });

  } catch (error) {
    console.error("ERRO CRÍTICO NO DASHBOARD:", error);
    res.status(500).json({ error: "Erro interno ao processar dados do dashboard." });
  }
};