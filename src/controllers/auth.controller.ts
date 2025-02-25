import { Request, Response } from "express";
import { loginUsuario, registerUser } from "../services/auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);

    if (!user) {
      return res.status(400).json({ message: "Erro ao criar usuário" });
    }

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ success: false, message: "E-mail e senha são obrigatórios." });
    }

    const resultado = await loginUsuario(email, senha);

    if (!resultado.success) {
      return res.status(401).json(resultado);
    }

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
};
