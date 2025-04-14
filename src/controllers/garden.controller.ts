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
          user: true, // opcional
        },
      });
  
      res.json(gardens);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar hortas" });
    }
  };
  