// ARQUIVO: src/controllers/supply.controller.ts

import { Request, Response } from 'express';
import { prisma } from "../../prisma/config/prisma.js"; 

const supplyInclude = {
  category: true, 
  unit: true,    
};

export const getSupplies = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;

  try {
    const supplies = await prisma.supply.findMany({
      where: {
        organizationId: organizationId,
        isActive: true, 
      },
      include: supplyInclude,
      orderBy: { name: 'asc' }
    });

    res.status(200).json(supplies);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar lista de Insumos' });
  }
};

export const createSupply = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { 
    name, brand, supplierLot, invoiceNumber, 
    quantity, minStock, unitPrice, withdrawalDays,
    unitId, categoryId 
  } = req.body;

  if (!name || quantity === undefined || !unitId || !categoryId) {
    return res.status(400).json({ message: "Nome, quantidade, unidade e categoria são obrigatórios." });
  }

  try {
    const newSupply = await prisma.supply.create({
      data: {
        name,
        brand,
        supplierLot,
        invoiceNumber,
        quantity: Number(quantity),
        minStock: Number(minStock || 0),
        unitPrice: unitPrice ? Number(unitPrice) : null,
        withdrawalDays: withdrawalDays ? Number(withdrawalDays) : 0,
        organizationId, // Simplificado
        categoryId: Number(categoryId),
        unitId: Number(unitId)
      },
      include: supplyInclude, 
    });

    res.status(201).json(newSupply);
  } catch (error) {
    console.error("Erro ao criar insumo:", error);
    res.status(500).json({ error: 'Erro ao criar o insumo' });
  }
};

export const deleteSupply = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { id } = req.params;

  try {
    const check = await prisma.supply.findFirst({
      where: { id: Number(id), organizationId }
    });

    if (!check) return res.status(404).json({ error: "Insumo não encontrado." });

    const updatedSupply = await prisma.supply.update({
      where: { id: Number(id) },
      data: { isActive: false },
      include: supplyInclude,
    });

    res.status(200).json(updatedSupply);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desativar o insumo' });
  }
};

export const updateSupply = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { id } = req.params;
  const data = req.body;

  try {
    const check = await prisma.supply.findFirst({
      where: { id: Number(id), organizationId }
    });

    if (!check) return res.status(404).json({ error: "Insumo não encontrado." });

    const updatedSupply = await prisma.supply.update({
      where: { id: Number(id) },
      data: {
        ...data,
        quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
        minStock: data.minStock !== undefined ? Number(data.minStock) : undefined,
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
        unitId: data.unitId ? Number(data.unitId) : undefined,
      },
      include: supplyInclude, 
    });

    res.status(200).json(updatedSupply);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o insumo' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.supplyCategory.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
};

export const getUnits = async (req: Request, res: Response) => {
  try {
    const units = await prisma.supplyUnit.findMany({
      orderBy: { name: 'asc' }
    });
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar unidades' });
  }
};