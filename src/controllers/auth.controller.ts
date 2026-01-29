// ARQUIVO: src/controllers/auth.controller.ts 

import { Request, Response } from "express";
import { registerUserService, loginUserService } from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";
import { prisma } from "../../prisma/config/prisma.js";


export const register = async (req: Request, res: Response) => {
  const { name, email, password, organizationName } = req.body;

  if (!name || !email || !password || !organizationName) {
    return res.status(400).json({ message: "Todos os campos (nome, email, senha, nome da organização) são obrigatórios." });
  }

  const result = await registerUserService(name, email, password, organizationName);

  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }

  res.status(201).json({ message: "Conta criada com sucesso!", data: result.data });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body; 
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "E-mail e senha são obrigatórios." });
  }

  const result = await loginUserService(email, password);

  if (!result.success || !result.data) {
    return res.status(401).json({ success: false, message: result.message });
  }

  const tokenPayload = {
    userId: result.data.userId,
    organizationId: result.data.organizationId,
    role: result.data.role,
  };

  const token = generateToken(tokenPayload);

  return res.status(200).json({
    success: true,
    message: "Login realizado com sucesso!",
    data: {
      user: {
        id: result.data.userId,
        email: result.data.email,
        name: result.data.name,
      },
      token,
    },
  });
};

export const getMe = async (req: any, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    const orgId = Number(req.user?.organizationId);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const organization = await prisma.organization.findUnique({
      where: { id: orgId }
    });

    if (!user || !organization) {
      return res.status(404).json({ message: "Dados não encontrados." });
    }

    const { password, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      organization: organization
    });

  } catch (error) {
    return res.status(500).json({ message: "Erro interno no servidor." });
  }
};
