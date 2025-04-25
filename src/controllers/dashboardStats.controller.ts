import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userId é obrigatório" });
  }

  try {
    const gardens = await prisma.gardenUser.findMany({
      where: { userId: Number(userId), isActive: true },
    });

    const totalGardens = gardens.length;
    const totalArea = gardens.reduce((sum, g) => sum + g.sizeInM2, 0);
    const averageSize = totalGardens > 0 ? totalArea / totalGardens : 0;
    const uniqueCrops = new Set(gardens.map((g) => g.crop)).size;
    const activeGardens = gardens.filter(g => g.isActive).length;
    const oldestGarden = gardens.reduce((oldest, current) =>
      new Date(current.plantingDate) < new Date(oldest.plantingDate) ? current : oldest, gardens[0]
    );

    res.json({
      totalGardens,
      activeGardens,
      averageSize,
      uniqueCrops,
      oldestGardenDate: oldestGarden?.plantingDate,
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    res.status(500).json({ error: "Erro ao obter estatísticas do dashboard" });
  }
};
