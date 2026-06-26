import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const createJournalEntry = async (req: Request, res: Response) => {
  const { title, type, description, date, imageUrl, gardenId } = req.body;
  const { userId } = req.user!;

  const entry = await prisma.journalEntry.create({
    data: { title, type, description, date: new Date(date), imageUrl, gardenId: Number(gardenId), userId },
  });
  res.status(201).json(entry);
};

export const getJournalByGarden = async (req: Request, res: Response) => {
  const { gardenId } = req.params;
  const entries = await prisma.journalEntry.findMany({
    where: { gardenId: Number(gardenId) },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(entries);
};
