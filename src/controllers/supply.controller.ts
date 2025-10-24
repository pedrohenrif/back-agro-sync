import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const supplyInclude = {
  category: true, 
  unit: true,    
};

export const getSupplys = async (req: Request, res: Response) => {
  try {
    const supplys = await prisma.supply.findMany({
      where: {
        isActive: true, 
      },
      include: supplyInclude,
    });

    res.status(200).json(supplys);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar lista de Insumos' });
  }
};

export const createSupply = async (req: Request, res: Response) => {
  const { name, quantity, unitId, userId, categoryId, isActive = true } = req.body;

  try {
    const newSupply = await prisma.supply.create({
      data: {
        name,
        quantity: Number(quantity),
        unitId,
        userId,
        categoryId,
        isActive,
      },
      include: supplyInclude, 
    });

    res.status(201).json(newSupply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar o insumo' });
  }
};

export const deleteSupply = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updatedSupply = await prisma.supply.update({
      where: { id: Number(id) },
      data: { isActive: false },
      include: supplyInclude,
    });

    res.status(200).json(updatedSupply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar o insumo' });
  }
};

export const updateSupply = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, quantity, unitId, categoryId } = req.body;

  try {
    const updatedSupply = await prisma.supply.update({
      where: { id: Number(id) },
      data: {
        name,
        quantity: Number(quantity),
        unitId,
        categoryId,
      },
      include: supplyInclude, 
    });

    res.status(200).json(updatedSupply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar o insumo' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.supplyCategory.findMany();

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar a lista de categorias' });
  }
};


export const getUnits = async (req: Request, res: Response) => {
  try {
    const units = await prisma.supplyUnit.findMany();

    res.status(200).json(units);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar a lista de unidades' });
  }
};