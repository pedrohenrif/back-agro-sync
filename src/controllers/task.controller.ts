// src/controllers/task.controller.ts
import { Request, Response } from 'express';
import { prisma } from "../../prisma/config/prisma.js";

export const getTasks = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;

  try {
    const tasks = await prisma.task.findMany({
      where: { organizationId },
      orderBy: { dueDate: 'asc' },
      include: { 
        assignedTo: { select: { name: true } },
        garden: { select: { name: true } } 
      }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
};

export const getTasksByGarden = async (req: Request, res: Response) => {
  const { gardenId } = req.params;
  const organizationId = req.user!.organizationId;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        gardenId: Number(gardenId),
        organizationId: organizationId // Segurança: filtro por empresa
      },
      orderBy: [
        { status: 'asc' }, // Primeiro as pendentes
        { dueDate: 'asc' } // Depois as mais próximas do prazo
      ]
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Erro ao buscar tarefas do canteiro:", error);
    res.status(500).json({ error: "Erro ao buscar tarefas do canteiro." });
  }
};

export const createTask = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { title, description, priority, dueDate, assignedToId, gardenId } = req.body;

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description, 
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        organization: { connect: { id: organizationId } },
        assignedTo: assignedToId ? { connect: { id: Number(assignedToId) } } : undefined,
        garden: gardenId ? { connect: { id: Number(gardenId) } } : undefined
      }
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar tarefa.' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, priority, status, dueDate, gardenId } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        // Lógica de vínculo: Se vier ID, conecta. Se não, desconecta.
        garden: gardenId 
          ? { connect: { id: Number(gardenId) } } 
          : { disconnect: true }
      },
      include: {
        // 🏡 Garante que a resposta da edição já venha com o nome do canteiro
        garden: { select: { name: true } },
        assignedTo: { select: { name: true } }
      }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    res.status(500).json({ error: "Erro ao atualizar tarefa." });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const organizationId = req.user!.organizationId; 

  try {
    const updated = await prisma.task.update({
      where: { 
        id: Number(id),
        organizationId 
      },
      data: { status },
      include: { 
        garden: { select: { name: true } } 
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Erro ao mudar status:", error);
    res.status(500).json({ error: 'Não foi possível atualizar o status da tarefa.' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  try {
    const task = await prisma.task.findFirst({
      where: { 
        id: Number(id), 
        organizationId: organizationId 
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou acesso negado.' });
    }

    await prisma.task.delete({
      where: { id: Number(id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    res.status(500).json({ error: 'Erro ao excluir a tarefa.' });
  }
};

export const getTodayTasks = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  
  // Criamos o intervalo de "hoje" (das 00:00 às 23:59)
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  try {
    const tasks = await prisma.task.findMany({
      where: {
        organizationId: Number(organizationId),
        dueDate: {
          gte: start,
          lte: end
        }
      },
      include: {
        garden: true // Para sabermos de que canteiro é a tarefa
      },
      orderBy: {
        priority: 'desc'
      }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar tarefas de hoje." });
  }
};

export const toggleTaskStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; 

  try {
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: { 
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null
      }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar tarefa." });
  }
};