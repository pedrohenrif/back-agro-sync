import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createGarden = async (req: Request, res: Response) => {
console.log(req)
  const {
    name,
    crop,
    plantingDate,
    sizeInM2,
    location,
    userId,
    isActive = true,
  } = req.body;

  try {
    const newGarden = await prisma.gardenUser.create({
      data: {
        name,
        crop,
        plantingDate: new Date(plantingDate),
        sizeInM2: Number(sizeInM2),
        location,
        userId,
        isActive,
      },
    });

    res.status(201).json(newGarden);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar a horta' });
  }
};

export const getGardens = async (req: Request, res: Response) => {
    const { userId } = req.query;
  
    try {
      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório na query" });
      }
  
      const gardens = await prisma.gardenUser.findMany({
        where: {
          userId: Number(userId),
        },
        include: {
          user: true,
        },
      });
  
      res.json(gardens);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar hortas" });
    }
  };
  
export const deleteGarden = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const garden = await prisma.gardenUser.findUnique({
        where: {
            id: Number(id),
        },
        });

        if (!garden) {
        return res.status(404).json({ error: 'Horta não encontrada' });
        }

        await prisma.gardenUser.delete({
        where: {
            id: Number(id),
        },
        });

        res.status(200).json({ message: 'Horta deletada com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao deletar a horta' });
    }
};