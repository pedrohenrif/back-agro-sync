// ARQUIVO: src/controllers/search.controller.ts

import { Request, Response } from "express";
import { prisma } from "../../prisma/config/prisma.js";

export const searchItems = async (req: Request, res: Response) => {
  const query = req.query.q as string;

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return res.status(400).json({ 
        success: false, 
        message: "Termo de busca inválido ou muito curto (mínimo 2 caracteres)." 
    });
  }

  const searchTerm = query.trim();

  try {
    const gardenResults = await prisma.gardenUser.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive', 
        },
        // Poderia adicionar busca em 'crop' também:
        // OR: [
        //   { name: { contains: searchTerm, mode: 'insensitive' } },
        //   { crop: { contains: searchTerm, mode: 'insensitive' } }
        // ]
        // E filtrar pelo usuário logado! Adicione a cláusula 'userId' aqui.
        // userId: SEU_USER_ID, 
      },
      select: { // Seleciona apenas os campos que você quer retornar
        id: true,
        name: true,
        crop: true,
        // Adicione outros campos se precisar
      }
    });

    res.status(200).json({
      success: true,
      results: {
        gardens: gardenResults,
        // supplies: supplyResults, // Adicionar quando implementar
      },
    });

  } catch (error) {
    console.error("Erro durante a busca:", error);
    res.status(500).json({ success: false, message: "Erro interno do servidor durante a busca." });
  }
};