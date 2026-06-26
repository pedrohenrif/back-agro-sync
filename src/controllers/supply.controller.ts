// ARQUIVO: src/controllers/supply.controller.ts

import { Request, Response } from 'express';
import { prisma } from "../core/database/prisma.js"; 

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

export const createSupply = async (req: any, res: Response) => {
  const userId = req.user?.userId 
  const organizationId = req.user?.organizationId;

  if (!userId || isNaN(Number(userId))) {
    return res.status(401).json({ message: "Usuário não identificado no token." });

  }

  const { 
    name, brand, supplierLot, invoiceNumber, 
    quantity, minStock, unitPrice, withdrawalDays,
    unitId, categoryId 
  } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newSupply = await tx.supply.create({
        data: {
          name,
          brand,
          supplierLot,
          invoiceNumber,
          quantity: Number(quantity),
          minStock: Number(minStock || 0),
          unitPrice: unitPrice ? Number(unitPrice) : null,
          withdrawalDays: Number(withdrawalDays || 0),
          organizationId: Number(organizationId),
          categoryId: Number(categoryId),
          unitId: Number(unitId)
        },
      });

      await tx.supplyTransaction.create({
        data: {
          type: 'ENTRY',
          quantity: Number(quantity),
          reason: 'Cadastro Inicial',
          supply: { connect: { id: newSupply.id } },
          organization: { connect: { id: Number(organizationId) } },
          user: { connect: { id: Number(userId) } }
        }
      });

      return newSupply;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error("ERRO DETALHADO:", error);
    res.status(500).json({ error: 'Erro ao criar o insumo', details: error.message });
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

export const updateSupply = async (req: any, res: Response) => {
  const organizationId = req.user!.organizationId;
  const userId = req.user!.userId || req.user!.sub; 
  const { id } = req.params;
  const data = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const currentSupply = await tx.supply.findFirst({
        where: { id: Number(id), organizationId }
      });

      if (!currentSupply) throw new Error("Insumo não encontrado.");

      const updatedSupply = await tx.supply.update({
        where: { id: Number(id) },
        data: {
          name: data.name,
          brand: data.brand,
          supplierLot: data.supplierLot,
          invoiceNumber: data.invoiceNumber,
          quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
          minStock: data.minStock !== undefined ? Number(data.minStock) : undefined,
          unitPrice: data.unitPrice !== undefined ? Number(data.unitPrice) : undefined,
          withdrawalDays: data.withdrawalDays !== undefined ? Number(data.withdrawalDays) : undefined,
          isActive: data.isActive,
          unit: data.unitId ? { connect: { id: Number(data.unitId) } } : undefined,
          category: data.categoryId ? { connect: { id: Number(data.categoryId) } } : undefined,
        },
        include: { category: true, unit: true }
      });

      if (data.quantity !== undefined) {
        const oldQty = currentSupply.quantity;
        const newQty = Number(data.quantity);
        const diff = newQty - oldQty;

        if (diff !== 0) {
          await tx.supplyTransaction.create({
            data: {
              type: diff > 0 ? 'ENTRY' : 'EXIT',
              quantity: Math.abs(diff),
              reason: data.reason || 'Ajuste manual via edição',
              supply: { connect: { id: updatedSupply.id } },
              organization: { connect: { id: Number(organizationId) } },
              user: { connect: { id: Number(userId) } }
            }
          });
        }
      }

      return updatedSupply;
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Erro ao atualizar insumo:", error);
    res.status(500).json({ error: 'Erro ao atualizar o insumo', details: error.message });
  }
};

export const getCategories = async (req: any, res: Response) => {
  try {
    const orgId = Number(req.user.organizationId); 

    const categories = await prisma.supplyCategory.findMany({
      where: {
        organizationId: orgId 
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar categorias" });
  }
};

export const createCategory = async (req: any, res: Response) => {
  const { name, description } = req.body;
  const orgId = Number(req.user.organizationId);

  try {
    const category = await prisma.supplyCategory.create({
      data: {
        name,
        description,
        organizationId: orgId
      }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar categoria" });
  }
};

export const deleteCategory = async (req: any, res: Response) => {
  const { id } = req.params;
  const orgId = Number(req.user.organizationId);

  try {
    await prisma.supplyCategory.deleteMany({
      where: {
        id: Number(id),
        organizationId: orgId
      }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: "Erro ao deletar categoria" });
  }
};

export const updateCategory = async (req: any, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const orgId = Number(req.user.organizationId);

  try {
    const updated = await prisma.supplyCategory.updateMany({
      where: {
        id: Number(id),
        organizationId: orgId // Trava de segurança
      },
      data: {
        name,
        description
      }
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "Categoria não encontrada ou sem permissão." });
    }

    res.json({ message: "Categoria atualizada com sucesso!" });
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar categoria" });
  }
};

export const getUnits = async (req: any, res: Response) => {
  try {
    const orgId = Number(req.user.organizationId);

    const units = await prisma.supplyUnit.findMany({
      where: {
        organizationId: orgId 
      },
      orderBy: {
        name: 'asc' 
      }
    });

    res.json(units);
  } catch (error) {
    console.error("Erro ao buscar unidades:", error);
    res.status(500).json({ message: "Erro ao buscar unidades de medida." });
  }
};

export const createUnit = async (req: any, res: Response) => {
  const { name, symbol } = req.body;
  const orgId = Number(req.user.organizationId);

  try {
    const newUnit = await prisma.supplyUnit.create({
      data: {
        name,
        symbol,
        organizationId: orgId
      }
    });
    res.status(201).json(newUnit);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar unidade" });
  }
};

export const deleteUnit = async (req: any, res: Response) => {
  const { id } = req.params;
  const orgId = Number(req.user.organizationId);

  try {
    await prisma.supplyUnit.deleteMany({
      where: {
        id: Number(id),
        organizationId: orgId
      }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: "Erro ao deletar unidade" });
  }
};

export const updateUnit = async (req: any, res: Response) => {
  const { id } = req.params;
  const { name, symbol } = req.body;
  const orgId = Number(req.user.organizationId);

  try {
    const updated = await prisma.supplyUnit.updateMany({
      where: {
        id: Number(id),
        organizationId: orgId // Trava de segurança
      },
      data: {
        name,
        symbol
      }
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "Unidade não encontrada ou sem permissão." });
    }

    res.json({ message: "Unidade atualizada com sucesso!" });
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar unidade" });
  }
};

export const getSupplyTransactions = async (req: Request, res: Response) => {
  const { id } = req.params; 
  const organizationId = req.user!.organizationId;

  try {
    const supply = await prisma.supply.findFirst({
      where: { id: Number(id), organizationId }
    });

    if (!supply) {
      return res.status(404).json({ message: "Insumo não encontrado." });
    }

    const transactions = await prisma.supplyTransaction.findMany({
      where: { 
        supplyId: Number(id),
        organizationId 
      },
      include: {
        user: {
          select: { name: true } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    res.status(500).json({ error: "Erro ao carregar histórico de movimentações." });
  }
};