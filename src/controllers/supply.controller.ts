import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


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
    });

    res.status(200).json(updatedSupply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar o insumo' });
  }
};


export const updateSupply = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, quantity, unitId } = req.body;

  try {
    const updatedSupply = await prisma.supply.update({
      where: { id: Number(id) },
      data: {
        name,
        quantity: Number(quantity),
        unitId,
      },
    });

    res.status(200).json(updatedSupply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar o insumo' });
  }
};


export const getCategories = async (req: Request, res: Response) => {
  try{
      const categories = await prisma.supplyCategory.findMany();

      res.status(200).json(categories)
  } catch (error){
    console.error(error)
    res.status(500).json({ error: 'Erro ao buscar a lista de categorias'})
  } 
}
