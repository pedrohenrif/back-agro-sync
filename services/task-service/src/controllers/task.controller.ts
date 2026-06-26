import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const getTasks = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const tasks = await prisma.task.findMany({
    where: { organizationId },
    orderBy: { dueDate: 'asc' },
    include: { assignedTo: { select: { name: true } }, garden: { select: { name: true } } },
  });
  res.json(tasks);
};

export const getTasksByGarden = async (req: Request, res: Response) => {
  const { gardenId } = req.params;
  const { organizationId } = req.user!;
  const tasks = await prisma.task.findMany({
    where: { gardenId: Number(gardenId), organizationId },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
  });
  res.json(tasks);
};

export const getTodayTasks = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  const tasks = await prisma.task.findMany({
    where: { organizationId: Number(organizationId), dueDate: { gte: start, lte: end } },
    include: { garden: true },
    orderBy: { priority: 'desc' },
  });
  res.json(tasks);
};

export const createTask = async (req: Request, res: Response) => {
  const { organizationId } = req.user!;
  const { title, description, priority, dueDate, assignedToId, gardenId } = req.body;
  const task = await prisma.task.create({
    data: {
      title, description, priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      organization: { connect: { id: organizationId } },
      assignedTo: assignedToId ? { connect: { id: Number(assignedToId) } } : undefined,
      garden: gardenId ? { connect: { id: Number(gardenId) } } : undefined,
    },
  });
  res.status(201).json(task);
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, priority, status, dueDate, gardenId } = req.body;
  const task = await prisma.task.update({
    where: { id: Number(id) },
    data: {
      title, description, priority, status,
      dueDate: dueDate ? new Date(dueDate) : null,
      garden: gardenId ? { connect: { id: Number(gardenId) } } : { disconnect: true },
    },
    include: { garden: { select: { name: true } }, assignedTo: { select: { name: true } } },
  });
  res.json(task);
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const { organizationId } = req.user!;
  const task = await prisma.task.update({
    where: { id: Number(id), organizationId },
    data: { status },
    include: { garden: { select: { name: true } } },
  });
  res.json(task);
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { organizationId } = req.user!;
  const task = await prisma.task.findFirst({ where: { id: Number(id), organizationId } });
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  await prisma.task.delete({ where: { id: Number(id) } });
  res.status(204).send();
};
