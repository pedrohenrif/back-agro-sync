// ARQUIVO: src/controllers/auth.controller.ts (Corrigido)

import { Request, Response } from "express";
import { registerUserService, loginUserService } from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";


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