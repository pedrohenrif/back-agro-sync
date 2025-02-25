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
    const { email, password } = req.body;
    const token = await loginUsuario(email, password);

    if (!token) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};
