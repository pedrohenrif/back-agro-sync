import { Request, Response } from 'express';
import { prisma } from "../core/database/prisma.js";


export const createJournalEntry = async (req: Request, res: Response) => {
  const { title, type, description, date, imageUrl, gardenId } = req.body;
  const userId = req.user!.id; 

  try {
    const entry = await prisma.journalEntry.create({
      data: {
        title,
        type,
        description,
        date: new Date(date),
        imageUrl,
        gardenId: Number(gardenId),
        userId: Number(userId)
      }
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar nota no diário." });
  }
};

export const getJournalByGarden = async (req: Request, res: Response) => {
  const { gardenId } = req.params;
  const entries = await prisma.journalEntry.findMany({
    where: { gardenId: Number(gardenId) },
    include: { user: { select: { name: true } } }, 
    orderBy: { createdAt: 'desc' }
  });
  res.json(entries);
};